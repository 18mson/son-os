export const DESKTOP_GRID = {
  CELL_WIDTH: 96,
  CELL_HEIGHT: 110,
  OFFSET_X: 28,
  OFFSET_Y: 28,
};

/**
 * Computes maximum available columns and rows based on screen viewport size
 * (leaving margins for shelf, desktop edges, and widgets).
 */
export function getGridBounds(screenWidth: number, screenHeight: number) {
  const maxCol = Math.max(0, Math.floor((screenWidth - 120) / DESKTOP_GRID.CELL_WIDTH));
  const maxRow = Math.max(0, Math.floor((screenHeight - 160) / DESKTOP_GRID.CELL_HEIGHT));
  return { maxCol, maxRow };
}

/**
 * Converts grid coordinates (column, row) to exact pixel position (x, y)
 */
export function gridToPixel(col: number, row: number): { x: number; y: number } {
  return {
    x: DESKTOP_GRID.OFFSET_X + col * DESKTOP_GRID.CELL_WIDTH,
    y: DESKTOP_GRID.OFFSET_Y + row * DESKTOP_GRID.CELL_HEIGHT,
  };
}

/**
 * Converts continuous raw pixel coordinates (e.g. from drag) to nearest clamped grid slot (col, row)
 */
export function pixelToGrid(
  pixelX: number,
  pixelY: number,
  screenWidth: number,
  screenHeight: number
): { col: number; row: number; maxCol: number; maxRow: number } {
  const { maxCol, maxRow } = getGridBounds(screenWidth, screenHeight);
  const rawCol = Math.round((pixelX - DESKTOP_GRID.OFFSET_X) / DESKTOP_GRID.CELL_WIDTH);
  const rawRow = Math.round((pixelY - DESKTOP_GRID.OFFSET_Y) / DESKTOP_GRID.CELL_HEIGHT);
  const col = Math.max(0, Math.min(rawCol, maxCol));
  const row = Math.max(0, Math.min(rawRow, maxRow));
  return { col, row, maxCol, maxRow };
}
