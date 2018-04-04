var express = require('express'),
  watch = require('node-watch'),
  childProc = require('child_process'),
  fs = require('fs');

var app = express(),
  fwAdRequests = [],
  fwAdBeacons = [];

app.get('/', function (req, res) {
  /*let rawdata = fs.readFileSync('logs/charles201803281456.chlsj');
  let jsonArr = JSON.parse(rawdata);
  fwAdRequests = [];
  fwAdBeacons = [];
  getAdDetails(jsonArr);
  //res.send("Ad Request Count: "+fwAdRequests.length+"<br/>Ad Beacons Count: "+fwAdBeacons.length);
  res.send(adRequestTests());*/
  res.send("Hi World!!!");
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

watch('logs', { recursive: true }, function(evt, name) {
  console.log('%s changed.', name);
  if (name.match(/\.chlsj$/)) {
    let rawdata = fs.readFileSync(name);
    let jsonArr = JSON.parse(rawdata);
    fwAdRequests = [];
    fwAdBeacons = [];
    getAdDetails(jsonArr);
    //res.send("Ad Request Count: "+fwAdRequests.length+"<br/>Ad Beacons Count: "+fwAdBeacons.length);
    //res.send(adRequestTests());
    let filePath = 'results/'+Date.now()+'.html';
    fs.writeFile(filePath,adRequestTests()+"<br/><br/><br/>"+adBeaconTests()+"<br/><br/><br/>"+adBeaconTimestampTests());
    childProc.exec('open -a "Google Chrome" '+filePath, function(){});
  }
});

var getAdDetails = (jsonArr) => {
  jsonArr.forEach ((item) => {

    if (!item.host == "29773.v.fwmrm.net"){
      return;
    }

    if (item.path == "/ad/g/1" &&
    item.query &&
    item.query.indexOf('nw=169843') != -1) {
      fwAdRequests.push(item);
    } else if (item.path == "/ad/l/1") {
      fwAdBeacons.push(item);
    }

  });
};

var adRequestTests = () => {
  var result = "<b>Ad request test results:</b> <br/>";
  result += "<div>Should have only one Ad request: Expected = 1, Actual = " + fwAdRequests.length + ". Result: " + (fwAdRequests.length == 1 ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
  result += "<div>Should have Global param: Expected = true, Actual = " + (fwAdRequests.length && fwAdRequests[0].query.split(';').length > 0 && fwAdRequests[0].query.split(';')[0] != "") + ". Result: " + ((fwAdRequests.length && fwAdRequests[0].query.split(';').length > 0 && fwAdRequests[0].query.split(';')[0] != "") ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
  result += "<div>Should have Key values: Expected = true, Actual = " + (fwAdRequests.length && fwAdRequests[0].query.split(';').length > 1 && fwAdRequests[0].query.split(';')[1] != "") + ". Result: " + ((fwAdRequests.length && fwAdRequests[0].query.split(';').length > 1 && fwAdRequests[0].query.split(';')[1] != "") ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
  result += "<div>Should have Slot params: Expected = true, Actual = " + (fwAdRequests.length && fwAdRequests[0].query.split(';').length > 2 && fwAdRequests[0].query.split(';')[2] != "") + ". Result: " + ((fwAdRequests.length && fwAdRequests[0].query.split(';').length > 2 && fwAdRequests[0].query.split(';')[2] != "") ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:orange'>WARN</span></div>");
  result += "<div>Should have Prod Network Id values: Expected = 'nw=169843', Actual = ''" + (fwAdRequests.length && fwAdRequests[0].query.match(/nw=169843/)[0]) + "'. Result: " + ((fwAdRequests.length && fwAdRequests[0].query.match(/nw=169843/).length == 1) ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
  return result;
}

var adBeaconTests = () => {
  var result = "<b>Ad Beacons test results:</b> <br/>";
  var impressionBeacons = [];
  result += "<div>Should have Ad beacons: Expected = Minimum 1, Actual = " + fwAdBeacons.length + ". Result: " + (fwAdBeacons.length > 1 ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
  impressionBeacons = getImpressionBeacons('slotImpression');
  result += "<div>Should have Slot impression beacons: Expected = 1, Actual = " + impressionBeacons.length + ". Result: " + (impressionBeacons.length == 1 ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
  impressionBeacons = getImpressionBeacons('defaultImpression');
  result += "<div>Should have Default impression beacons: Expected = 2, Actual = " + impressionBeacons.length + ". Result: " + (impressionBeacons.length == 2 ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
  impressionBeacons = getImpressionBeacons('firstQuartile');
  result += "<div>Should have firstQuartile impression beacons: Expected = 2, Actual = " + impressionBeacons.length + ". Result: " + (impressionBeacons.length == 2 ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
  impressionBeacons = getImpressionBeacons('midPoint');
  result += "<div>Should have midPoint impression beacons: Expected = 2, Actual = " + impressionBeacons.length + ". Result: " + (impressionBeacons.length == 2 ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
  impressionBeacons = getImpressionBeacons('thirdQuartile');
  result += "<div>Should have thirdQuartile impression beacons: Expected = 2, Actual = " + impressionBeacons.length + ". Result: " + (impressionBeacons.length == 2 ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
  impressionBeacons = getImpressionBeacons('complete');
  result += "<div>Should have complete impression beacons: Expected = 2, Actual = " + impressionBeacons.length + ". Result: " + (impressionBeacons.length == 2 ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
  return result;
}

var adBeaconTimestampTests = () => {
  var result = "<b>Ad Beacons Timestamp test results:</b> <br/>",
    impressionBeacons = [],
    impressionsGroupByAds = [];

  impressionBeacons = getImpressionBeacons('defaultImpression');
  impressionBeacons.forEach( (item) => {
    var matches = item.query.match(/&adid=([0-9]*)&/),
      adId = (matches && matches.length && matches.length > 1 ? matches[1] : "");
      if (adId) {
          impressionsGroupByAds.push(getImpressionBeaconsForAdId(adId));
      }
  })
  //console.log(impressionsGroupByAds);
  impressionsGroupByAds.forEach( (item) => {
    item.sort( (item1, item2) => {
      return new Date(item1.times.requestBegin).getTime() - new Date(item2.times.requestBegin).getTime();
    })
    result += "<br/><br/><div>Should have defaultImpression beacon first: Expected = true, Actual = " + (item[0] && item[0].query.match(/cn=defaultImpression/)) + ". Result: " + (item[0] && item[0].query.match(/cn=defaultImpression/) ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
    result += "<div>Should have firstQuartile beacon second: Expected = true, Actual = " + (item[1] && item[1].query.match(/cn=firstQuartile/)) + ". Result: " + (item[1] && item[1].query.match(/cn=firstQuartile/) ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
    result += "<div>Should have midPoint beacon third: Expected = true, Actual = " + (item[2] && item[2].query.match(/cn=midPoint/)) + ". Result: " + (item[2] && item[2].query.match(/cn=midPoint/) ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
    result += "<div>Should have thirdQuartile beacons fourth: Expected = true, Actual = " + (item[3] && item[3].query.match(/cn=thirdQuartile/)) + ". Result: " + (item[3] && item[3].query.match(/cn=thirdQuartile/) ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
    result += "<div>Should have complete beacons last: Expected = true, Actual = " + (item[4] && item[4].query.match(/cn=complete/)) + ". Result: " + (item[4] && item[4].query.match(/cn=complete/) ? "<span style='font-weight:bold;'>PASS</span>" : "<span style='font-weight:bold;color:red'>FAIL</span></div>");
  });



  return result;

}

var getImpressionBeacons = (beaconName) => {
  var slotImpressionBeacons = [],
    beaconExp = new RegExp('cn='+beaconName);
  fwAdBeacons.forEach ( (item) => {
    if (item.query.match(beaconExp)) {
      slotImpressionBeacons.push(item);
    }
  });
  return slotImpressionBeacons;
}

var getImpressionBeaconsForAdId = (adId) => {
  var impressionBeacons = [],
    adIdExp = new RegExp('adid='+adId),
    impressionTypeExp = new RegExp('cn=(defaultImpression|firstQuartile|midPoint|thirdQuartile|complete)');
  fwAdBeacons.forEach ( (item) => {
    if (item.query.match(adIdExp) && item.query.match(impressionTypeExp)) {
      impressionBeacons.push(item);
    }
  });
  //console.log('impressionBeacons',impressionBeacons);
  return impressionBeacons;
}
