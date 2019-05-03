const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const { dialogflow } = require("actions-on-google");
const app = dialogflow({ debug: true });
const fetch = require("node-fetch");

//START INTENTS

//INTENT DESIGNED TO HELP USER FIND WINE BASED ON THE USER'S REQUESTED PARAMETERS
app.intent("help_me", async (conv, params) => {
  const wineNumberContext = {
    // Custom parameters to pass with context
    anotherwine: 1
  };
  conv.contexts.set("anotherwine", 1, wineNumberContext);
  if (conv.parameters.color) {
    let wineColor = params.color;
    const data = await request();
    let wines = [];
    for (i = 0; i < data.length; i++) {
      if (wineColor.toLowerCase() == data[i].color.toLowerCase()) {
        wines.push({
          wineName: data[i].wineName,
          year: data[i].year,
          id: data[i]._id
        });
      }
    }
    if (wines.length < 1) {
      conv.ask(
        "many apologies, i cannot find any " +
          wineColor +
          " wines in your cellar. Perhaps try asking for a different type of wine"
      );
    } else if (wines.length > 1) {
      const wineConextId = {
        // Custom parameters to pass with context
        wineID: wines[0].id
      };
      conv.contexts.set("wineContextId", 1, wineConextId);
      conv.ask(
        "an excellent choice my lord. I found " +
          wines.length +
          " " +
          wineColor +
          " wines. The first is a " +
          wines[0].year +
          " " +
          wines[0].wineName +
          " would you like to hear more details, choose this wine to drink, or hear another option?"
      );
    } else {
      const wineConextId = {
        // Custom parameters to pass with context
        wineID: wines[0].id
      };
      conv.contexts.set("wineContextId", 1, wineConextId);
      conv.ask(
        "an excellent choice my lord. I found " +
          wines.length +
          wineColor +
          " wine. A " +
          wines[0].year +
          " " +
          wines[0].wineName
      );
    }
  } else if (conv.parameters.wine) {
    let wineType = params.wine;
    const data = await request();
    let wines = [];
    for (i = 0; i < data.length; i++) {
      if (wineType.toLowerCase() == data[i].type.toLowerCase()) {
        wines.push({
          wineName: data[i].wineName,
          year: data[i].year,
          wineType: data[i].type,
          id: data[i]._id
        });
      }
    }
    if (wines.length < 1) {
      conv.ask(
        "many apologies, i cannot find any " +
          wineType +
          " wines in your cellar. Perhaps try asking for a different type of wine"
      );
    } else if (wines.length > 1) {
      const wineConextId = {
        // Custom parameters to pass with context
        wineID: wines[0].id
      };
      conv.contexts.set("wineContextId", 1, wineConextId);
      conv.ask(
        "an excellent choice my lord. I found " +
          wines.length +
          " " +
          wines[0].wineType +
          "'s. The first is a " +
          wines[0].year +
          " " +
          wines[0].wineName +
          " " +
          wines[0].wineType +
          " would you like to hear more details, choose this wine to drink, or hear another option?"
      );
    } else {
      const wineConextId = {
        // Custom parameters to pass with context
        wineID: wines[0].id
      };
      conv.contexts.set("wineContextId", 1, wineConextId);
      conv.ask(
        "an excellent choice my lord. I found " +
          wines.length +
          " " +
          wines[0].year +
          " " +
          wines[0].wineName +
          " " +
          wines[0].wineType +
          ", do you want to drink this wine or hear more details?"
      );
    }
  }
});

//FOLLOWUP INTENT TO HELP FIND A DIFFERENT KIND OF WINE
app.intent("help_me_another", async conv => {
  let newWine = conv.contexts.input.anotherwine.parameters.anotherwine + 1;
  const wineNumberContext = {
    // Custom parameters to pass with context
    anotherwine: newWine
  };
  conv.contexts.delete("wineContextId");
  conv.contexts.delete("anotherwine");
  conv.contexts.set("anotherwine", 1, wineNumberContext);
  const data = await request();

  let wines = [];
  if (conv.contexts.input.wine_type.parameters.wine.length) {
    let wineType = conv.contexts.input.wine_type.parameters.wine;

    for (i = 0; i < data.length; i++) {
      if (wineType.toLowerCase() == data[i].type.toLowerCase()) {
        wines.push({
          wineName: data[i].wineName,
          year: data[i].year,
          wineType: data[i].type,
          id: data[i]._id
        });
      }
    }
    if (wines.length > newWine - 1) {
      const wineConextId = {
        wineID: wines[newWine - 1].id
      };
      conv.contexts.set("wineContextId", 1, wineConextId);

      conv.ask(
        "How about a " + wines[newWine - 1].year + " " + wines[newWine - 1].wineType +  " " + wines[newWine - 1].wineName
      );
    } else {
      conv.ask(
        "That's all the " + wineType + " wines I can find in your cellar"
      );
    }
  } else {
    let wineType = conv.contexts.input.wine_type.parameters.color;
    for (i = 0; i < data.length; i++) {
      if (wineType.toLowerCase() == data[i].color.toLowerCase()) {
        wines.push({
          wineName: data[i].wineName,
          year: data[i].year,
          wineType: data[i].type,
          id: data[i]._id
        });
      }
    }
    if (wines.length > newWine - 1) {
      const wineConextId = {
        // Custom parameters to pass with context
        wineID: wines[newWine - 1].id
      };
      conv.contexts.set("wineContextId", 1, wineConextId);
      conv.ask(
        wines[newWine - 1].year +
          " " +
          wines[newWine - 1].wineType +
          " " +
          wines[newWine - 1].wineName
      );
    } else {
      conv.ask(
        "That's all the " + wineType + " wines I can find in your cellar"
      );
    }
  }
});

//INTENT TO TELL USER HOW MANY BOTTLES OF WINE IS IN THEIR CELLAR
app.intent("how_much", async conv => {
  const data = await request();
  if (data.length < 15) {
    conv.ask(
      "you have " + data.length + " bottles of wine, you should reorder soon."
    );
  } else {
    conv.ask(
      "you have " +
        data.length +
        " bottles of wine, you only have room to store " +
        (29 - data.length) +
        "more bottles."
    );
  }
});

//INTENT TO TELL USER WHERE THEY HAVE OPEN SLOTS TO PUT NEW WINE
app.intent("open_slots", async conv => {
  const data = await request();
  let empty = [];
  for (j = 1; j < 30; j++) {
    for (x = 0; x < data.length; x++) {
      if (data[x].slotnumber == j) {
        break;
      } else if (data[x].slotnumber != j && x == data.length - 1) {
        empty.push(j);
      }
    }
  }
  conv.ask(
    "you have " +
      empty.length +
      " free slots. The first open slot is " +
      empty[0]
  );
});

//FOLLOWUP INTENT TO FINDING WINE, TO REMOVE WINE FROM INVENTORY
app.intent("help_me_drink_this_wine", async conv => {
  const data = await requestSpecific(
    conv.contexts.input.winecontextid.parameters.wineID
  );
  conv.ask(
    "you can find this wine in slot " +
      data.slotnumber +
      ". I will remove from your inventory but keep on in the database in case you want to review."
  );
});

app.intent("help_me_drink_this_wine_another", async conv => {
  const data = await requestSpecific(
    conv.contexts.input.winecontextid.parameters.wineID
  );
  conv.ask(
    "you can find this wine in slot " +
      data.slotnumber +
      ". I will remove from your inventory but keep on in the database in case you want to review."
  );
});

//INTENT TO TELL USER WHAT WINES ARE IN THEIR INVENTORY
app.intent("what_to_reorder", async conv => {
  let winetypes = [
    { wine: "monastrell", value: 0 },
    { wine: "viognier", value: 0 },
    { wine: "tempranillo", value: 0 },
    { wine: "white blend", value: 0 },
    { wine: "red blend", value: 0 },
    { wine: "setite sirah", value: 0 },
    { wine: "pinot noir", value: 0 },
    { wine: "cabernet sauvignon", value: 0 },
    { wine: "syrah", value: 0 },
    { wine: "chardonnay", value: 0 },
    { wine: "pinot grigio", value: 0 },
    { wine: "zinfandel", value: 0 },
    { wine: "malbec", value: 0 },
    { wine: "champagne", value: 0 },
    { wine: "rosé", value: 0 },
    { wine: "sauvignon blanc", value: 0 },
    { wine: "sparkling", value: 0 }
  ];
  const data = await request();
  for (i = 0; i < data.length; i++) {
    for (j = 0; j < winetypes.length; j++) {
      if (data[i].type == winetypes[j].wine) {
        winetypes[j]["value"] = winetypes[j].value + 1;
      }
    }
  }
  conv.ask(
    "right now in your cellar you have " +
      winetypes[0].value + " " + winetypes[0].wine + "'s, " +
      winetypes[1].value + " " + winetypes[1].wine + "'s, " +
      winetypes[2].value + " " + winetypes[2].wine + "'s, " +
      winetypes[3].value + " " + winetypes[3].wine + "'s, " +
      winetypes[4].value + " " + winetypes[4].wine + "'s, " +
      winetypes[5].value + " " + winetypes[5].wine + "'s, " +
      winetypes[6].value + " " + winetypes[6].wine + "'s, " +
      winetypes[7].value + " " + winetypes[7].wine + "'s, " +
      winetypes[8].value + " " + winetypes[8].wine + "'s, " +
      winetypes[9].value + " " + winetypes[9].wine + "'s, " +
      winetypes[10].value + " " + winetypes[10].wine + "'s, "
  );
});

app.catch((conv, error) => {
  console.error(error);
  conv.ask("There was an error" + "---------" + JSON.stringify(error));
});

app.fallback(conv => {
  conv.ask(`I couldn't understand. Can you say that again?`);
});

async function request() {
  const response = await fetch(
    "https://7a9jks7jzi.execute-api.us-east-1.amazonaws.com/dev/wines"
  );
  const json = await response.json();
  return json;
}

async function requestSpecific(wineID) {
  const url =
    "https://7a9jks7jzi.execute-api.us-east-1.amazonaws.com/dev/wines/" +
    wineID;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

exports.fulfillment = functions.https.onRequest(app);
