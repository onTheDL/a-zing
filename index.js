const { Engine, Render, Runner, World, Bodies } = Matter;

//CONSTANTS
const cells = 3; //total number of cells in horizontal and vertical direction
const width = 600;
const height = 600;

const unitLength = width / cells


//Directional constants
const up = 'up';
const right = 'right';
const down = 'down';
const left = 'left';

// Wall constant
const wallWidth = 2;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine,
  options: {
    //are pixels values
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

// a helper fxn to randomize maze
const shuffle = arr => {
  let counter = arr.length

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter)

    counter--

    const temp = arr[counter]
    arr[counter] = arr[index]
    arr[index] = temp
  }
  return arr
}

const grid = Array(cells)
  .fill(null)
  .map(() => Array(cells).fill(false));

const verticals = Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
  .fill(null)
  .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const traverseCell = (row, column) => {
  // If cell at [row, column] was visited, then return
  if (grid[row][column] === true) return;

  // Mark this cell as visited
  grid[row][column] = true

  // Assemble randomly-ordered list of neighbours
  const neighbours = shuffle([
    [row - 1, column, up], 
    [row, column + 1, right],
    [row + 1, column, down],
    [row, column - 1, left], 
  ])

  // For each neighbour ...
  for (let neighbour of neighbours) {

  // nextRow and nextColumn are where user might go next
    const [nextRow, nextColumn, direction] = neighbour

    // See if that neighbour is out of bounds
    if(nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
      //this skips over this el in iteration and goes on to the next -- i.e. skips the steps below
      continue;
    }

  // If user has visited that neighbour, continue to next neighbour
    if (grid[nextRow][nextColumn]) {
      continue
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
    traverseCell(nextRow, nextColumn)
  }
  
}

traverseCell(startRow, startColumn)

//Drawing rectangles in matterJS
horizontals.forEach((row, rowIndex) => {
  
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength / 2,
      rowIndex * unitLength + unitLength,
      unitLength,
      5,
      {
        isStatic: true,
      }
    )
    World.add(world, wall)
  })
}) 

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength,
      rowIndex * unitLength + unitLength / 2,
      5,
      unitLength,
      {
        isStatic: true,
      }
    )
    World.add(world, wall)
  })
}) 

const goal = Bodies.rectangle(
  width - unitLength / 2,
  height - unitLength / 2,
  unitLength * .7, //scale with the size of the cell, i.e. 70%
  unitLength * .7,
  {
    isStatic: true,
  }
)

World.add(world, goal)