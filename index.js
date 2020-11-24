const { Engine, Render, Runner, World, Bodies, Body, Events, } = Matter;

//CONSTANTS
const cellsHorizontal = 40;
const cellsVertical = 30;

// Refactored to span entire screen width and height
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

//Directional constants
const up = "up";
const right = "right";
const down = "down";
const left = "left";

// Wall constant
const wallWidth = 2;

// Ball velocity
const velocity = 3;

const engine = Engine.create();
const { world } = engine;
world.gravity.y = 0; // sets gravity effect on obj to zero

const render = Render.create({
  element: document.body,
  engine,
  options: {
    width,
    height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, wallWidth, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, wallWidth, { isStatic: true }),
  Bodies.rectangle(0, height / 2, wallWidth, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, wallWidth, height, { isStatic: true }),
];
World.add(world, walls);


// MAZE GENERATION
const shuffle = (arr) => { // a helper fxn to randomize maze
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const traverseCell = (row, column) => {
  // If cell at [row, column] was visited, then return
  if (grid[row][column] === true) return;

  // Mark this cell as visited
  grid[row][column] = true;

  // Assemble randomly-ordered list of neighbours
  const neighbours = shuffle([
    [row - 1, column, up],
    [row, column + 1, right],
    [row + 1, column, down],
    [row, column - 1, left],
  ]);

  // For each neighbour ...
  for (let neighbour of neighbours) {
    // nextRow and nextColumn are where user might go next
    const [nextRow, nextColumn, direction] = neighbour;

    // See if that neighbour is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      //this skips over this el in iteration and goes on to the next -- i.e. skips the steps below
      continue;
    }

    // If user has visited that neighbour, continue to next neighbour
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    //Remove a wall from either horizontals or verticals array

    //Updating verticals
    if (direction === left) {
      verticals[row][column - 1] = true;
    } else if (direction === right) {
      verticals[row][column] = true;
    }

    //Updating horizontals
    if (direction === up) {
      horizontals[row - 1][column] = true;
    } else if (direction === down) {
      horizontals[row][column] = true;
    }

    // Visit that next cell
    traverseCell(nextRow, nextColumn);
  }
};

traverseCell(startRow, startColumn);

//Drawing rectangles in matterJS
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        label: 'wall',
        isStatic: true,
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      {
        label: 'wall',
        isStatic: true,
      }
    );
    World.add(world, wall);
  });
});

//End-goal
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7, //scale with the size of the cell, i.e. 70%
  unitLengthY * 0.7,
  {
    isStatic: true,
    label: 'goal',
  }
);
World.add(world, goal);
   
//Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
  unitLengthX / 2,
  unitLengthY / 2,
  ballRadius,
  {
    label: 'ball'
  },
);
World.add(world, ball);

// DOM EVENTS
document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;
  
  if (event.code === "KeyW" || event.key === "ArrowUp") {
    Body.setVelocity(ball, { x, y: y - velocity }) // sets velocity change in y-axis
  }
  if (event.code === "KeyD" || event.key === "ArrowRight") {
    Body.setVelocity(ball, { x: x + velocity, y }) // sets velocity change in x-axis
  }
  if (event.code === "KeyS" || event.key === "ArrowDown") {
    Body.setVelocity(ball, { x, y: y + velocity }) 
  }
  if (event.code === "KeyA" || event.key === "ArrowLeft") {
    Body.setVelocity(ball, { x: x - velocity, y })
  }
});

// WIN CONDITION
Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach((collision) => {
    const labels = ['ball', 'goal'];

    if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
      
      //Win animation
      world.gravity.y = 1;
      world.bodies.forEach(body => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      })
    }
  })
})
