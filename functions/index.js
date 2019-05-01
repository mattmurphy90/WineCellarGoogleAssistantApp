const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const {
  dialogflow
} = require('actions-on-google')
const app = dialogflow({ debug : true});
const fetch = require("node-fetch");

app.intent('help_me_another', async (conv) => {
  let newWine = conv.contexts.input.anotherwine.parameters.anotherwine + 1;
  const testparameters = { // Custom parameters to pass with context
    anotherwine: newWine
  };
  conv.contexts.delete('anotherwine');
  conv.contexts.set('anotherwine', 1, testparameters);
  const data = await request();

  let wines = [];
  let wineType = conv.contexts.input.wine_type.parameters.wine;
  for (i=0; i < data.length; i++) {
    if (wineType.toLowerCase() == data[i].type.toLowerCase()) {
      wines.push({wineName : data[i].wineName, year : data[i].year});
    }
  }
  if (wines.length >= newWine) {
    conv.ask("how about a " + wines[newWine -1].year + " " + wines[newWine -1].wineName);
  } else {
      conv.ask("That's all the " + wineType + " wines I can find in your cellar");
  }
});

app.intent('how_much', async (conv) => {
  const data = await request();
  if (data.length < 15) {
    conv.close("you have " + data.length + " bottles of wine, you should reorder soon.");
  } else {
    conv.close("you have " + data.length + " bottles of wine, you only have room to store " + (29 - data.length) + " bottles.");
  }
});

app.intent('what_to_reorder', async (conv) => {
  let winetypes = [{wine : "pinot noir", value: 0}, {wine : "cabernet sauvignon", value : 0}, {wine : "syrah", value : 0}, {wine : "chardonnay", value : 0}, {wine : "pinot grigio", value : 0}, {wine : "zinfandel", value : 0},
  {wine : "malbec", value : 0}, {wine : "champagne", value : 0}, {wine : "rosé", value : 0}, {wine: "sauvignon blanc", value : 0}, {wine: "sparkling", value : 0}, ];
  const data = await request();
  for (i = 0; i < data.length; i++) {
    for (j = 0; j < winetypes.length; j++) {
      if (data[i].type == winetypes[j].wine) {
        winetypes[j]['value'] = winetypes[j].value + 1;
      }
    }
  }
    conv.close("right now in your cellar you have " +
      winetypes[0].value + " " + winetypes[0].wine + "'s, "
      + winetypes[1].value + " " + winetypes[1].wine + "'s, "
      + winetypes[2].value + " " + winetypes[2].wine + "'s, "
      + winetypes[3].value + " " + winetypes[3].wine + "'s, "
      + winetypes[4].value + " " + winetypes[4].wine + "'s, "
      + winetypes[5].value + " " + winetypes[5].wine + "'s, "
      + winetypes[6].value + " " + winetypes[6].wine + "'s, "
      + winetypes[7].value + " " + winetypes[7].wine + "'s, "
      + winetypes[8].value + " " + winetypes[8].wine + "'s, "
      + winetypes[9].value + " " + winetypes[9].wine + "'s, "
      + winetypes[10].value + " " + winetypes[10].wine + "'s, "
    );
});

app.intent('help_me', async (conv, params) => {
  const testparameters = { // Custom parameters to pass with context
    anotherwine: 1
  };
  conv.contexts.set('anotherwine', 1, testparameters);
 if (conv.parameters.color) {
     let wineColor = params.color;
     const data = await request();
     let wines = [];
     for (i=0; i < data.length; i++) {
       if (wineColor.toLowerCase() == data[i].color.toLowerCase()) {
         wines.push({wineName : data[i].wineName, year : data[i].year});
       }
     }
     if (wines.length < 1) {
       conv.ask('many apologies, i cannot find any ' + wineColor + " wines in your cellar. Perhaps try asking for a different type of wine");
     } else if (wines.length > 1) {
         conv.ask('an excellent choice my lord. I found ' + wines.length + " " + wineColor + " wines. The first is a " + wines[0].year + " " + wines[0].wineName + " would you like to hear more details, choose this wine to drink, or hear another option?");
     } else {
       conv.close('an excellent choice my lord. I found one ' + wines.length + wineColor + " wine. A " + wines[0].year + " " + wines[0].wineName);
     }
   } else if (conv.parameters.wine) {
      let wineType = params.wine;
      const data = await request();
      let wines = [];
      for (i=0; i < data.length; i++) {
        if (wineType.toLowerCase() == data[i].type.toLowerCase()) {
          wines.push({wineName : data[i].wineName, year : data[i].year});
        }
      }
      if (wines.length < 1) {
        conv.ask('many apologies, i cannot find any ' + wineType + " wines in your cellar. Perhaps try asking for a different type of wine");
      } else if (wines.length > 1) {
          conv.ask('an excellent choice my lord. I found ' + wines.length + " " + wineType + " wines. The first is a " + wines[0].year + " " + wines[0].wineName + " would you like to hear more details, choose this wine to drink, or hear another option?");
      } else {
        conv.close('an excellent choice my lord. I found one ' + wines.length + wineType + " wine. A " + wines[0].year + " " + wines[0].wineName);
      }
    }
  });

app.catch((conv, error) => {
  console.error(error);
  conv.ask("There was an error" + "---------" + JSON.stringify(error));
});

app.fallback((conv) => {
  conv.ask(`I couldn't understand. Can you say that again?`);
});

async function request() {
    const response = await fetch('https://7a9jks7jzi.execute-api.us-east-1.amazonaws.com/dev/wines');
    const json = await response.json();
    return json;
}


exports.fulfillment = functions.https.onRequest(app);
