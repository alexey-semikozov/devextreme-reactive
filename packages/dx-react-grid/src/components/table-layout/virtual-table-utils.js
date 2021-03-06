const OVERSCAN = 3;

export const STUB_TYPE = 'stub';
const VISIBLE_TYPE = 'visible';
const OVERSCAN_TYPE = 'overscan';

const STARTING_KEY = 'starting';
const ENDING_KEY = 'ending';

export const getVisibleRows = (rows, viewportTop, viewportHeight, getRowHeight) => {
  const result = [];

  const viewportBottom = viewportTop + viewportHeight;
  let topPosition = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const lastIndex = result.length - 1;
    const last = result[lastIndex];

    const height = getRowHeight(row);
    const bottomPosition = topPosition + height;
    if (
      (topPosition >= viewportTop && topPosition < viewportBottom) ||
      (bottomPosition > viewportTop && bottomPosition <= viewportBottom) ||
      (topPosition < viewportTop && bottomPosition > viewportBottom)
    ) {
      if (last && last.type === STUB_TYPE) {
        rows.slice(Math.max(0, i - OVERSCAN), i).forEach((overscanRow) => {
          const overscanRowSize = getRowHeight(overscanRow);
          last.height -= overscanRowSize;
          result.push({ type: OVERSCAN_TYPE, height: overscanRowSize, row: overscanRow });
        });
        if (last.height === 0) {
          result.splice(lastIndex, 1);
        }
      }
      result.push({ type: VISIBLE_TYPE, height, row });
    } else if (last && last.type === STUB_TYPE) {
      last.height += height;
    } else if (i > 0) {
      rows.slice(i, i + OVERSCAN).forEach((overscanRow) => {
        const overscanRowSize = getRowHeight(overscanRow);
        result.push({ type: OVERSCAN_TYPE, height: overscanRowSize, row: overscanRow });
      });
      i += OVERSCAN - 1;
      if (i < rows.length) {
        result.push({ type: STUB_TYPE, key: ENDING_KEY, height: 0 });
      }
    } else {
      result.push({ type: STUB_TYPE, key: STARTING_KEY, height });
    }
    topPosition = bottomPosition;
  }

  return result;
};

const getRowPosition = (visibleRows, index) => visibleRows
  .slice(0, index)
  .reduce((acc, row) => acc + row.height, 0);

export const firstVisibleRowOffset = (prevVisibleRows, visibleRows) => {
  const firstVisibleRowIndex = visibleRows.findIndex(row => row.type === VISIBLE_TYPE);
  if (firstVisibleRowIndex === -1) return 0;

  const firstVisibleRow = visibleRows[firstVisibleRowIndex].row;
  const prevIndex = prevVisibleRows.findIndex(row => row.row === firstVisibleRow);
  if (prevIndex === -1) return 0;

  const position = getRowPosition(visibleRows, firstVisibleRowIndex);
  const prevPosition = getRowPosition(prevVisibleRows, prevIndex);
  return position - prevPosition;
};
