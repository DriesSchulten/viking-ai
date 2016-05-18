var request = require('request');
var async = require('async');

const url = "http://52.58.199.76:8080/api/vikings";

var vikings = [];

async.parallel([
  function() {
    startAI("alex-dries-1", 0);
  },
  function() {
    startAI("alex-dries-2", 1);
  },
  function() {
    startAI("alex-dries-3", 2);
  },
  function() {
    startAI("alex-dries-4", 3);
  },
  function() {
    startAI("alex-dries-5", 4);
  },
  function() {
    startAI("alex-dries-6", 5);
  },
  function() {
    startAI("alex-dries-7", 6);
  },
  function() {
    startAI("alex-dries-8", 7);
  },
  function() {
    startAI("alex-dries-9", 8);
  },
  function() {
    startAI("alex-dries-10", 9);
  }
]);

function startAI(name, index) {
  request.post({url: url, form: {name:name}}, function(err, httpResponse, body) {
    const parsed = JSON.parse(body);
    console.log(body);
    vikings[index] = parsed;
    doTick(index);
    setInterval(function() { doTick(index); }, 1000);
  });
}

function doTick(index) {
  request.get(url, function(err, response, body) {
    const obj = JSON.parse(body);
    const list = obj.vikings;

    const closest = findClosest(list, index);

    if (closest !== undefined) {
      const target = list.filter(function(v) {
        return v.position === closest.position;
      })[0];

      console.log(closest.distance);
      if (closest.distance <= Math.sqrt(2)) {
        doAttack(target, index);
      } else if (closest.distance > 3 && vikings[index].health < 2) {
        doHeal(index);
      } else {
        doMove(target, index);
      }
    }
  });
}

function doAction(target, action, index) {
  const viking = vikings[index];
  const xDiff = viking.position.x - target.position.x;
  const yDiff = viking.position.y - target.position.y;

  if (action === "attack") {
    console.log("Attacking: to x: " + xDiff + ", y: " + yDiff);
  }

  var moveX = 0;
  var moveY = 0;

  if (xDiff > 0) {
    moveX = -1;
  } else if (xDiff < 0) {
    moveX = 1;
  }

  if (yDiff > 0) {
    moveY = -1;
  } else if (yDiff < 0) {
    moveY = 1;
  }

  console.log("We are at: " + JSON.stringify(viking.position) + ", and are moving to: " + JSON.stringify({x: moveX, y: moveY}));

  const obj = {id: viking.id, action: {order: action, position: {x: moveX, y: moveY}}};
  request({url: url, body: obj, json: true, method: "PUT"}, function(err, httpResponse, body) {

  });
}

function doAttack(target, index) {
  console.log("Beginnig attack");
  doAction(target, "attack", index);
}

function doMove(target, index) {
  console.log("Beginnig move");
  doAction(target, "move", index);
}

function doHeal(index) {
  const obj = {id: viking.id, action: {order: 'heal'}};
  request({url: url, body: obj, json: true, method: "PUT"}, function(err, httpResponse, body) {
  });
}

function findClosest(list, index) {
  const viking = vikings[index];
  const ours = viking.position;

  list.forEach(function(v) {
    if (v.name === viking.name) {
      viking.position = v.position;
      viking.health = v.health;
    }
  });

  const target = list.filter(function(v) {
    return v.name !== viking.name;
  }).map(function(v) {
    const other = v.position;
    const distance = Math.sqrt(Math.pow(ours.x - other.x, 2) + Math.pow(ours.y - other.y, 2));

    return {distance: distance, name: v.name, position: other};
  }).sort(function (a,b) {
    return a.distance - b.distance;
  })[0];

  return target;
}