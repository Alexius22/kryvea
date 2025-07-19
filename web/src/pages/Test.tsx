import Grid from "../components/Composition/Grid";

export default function Test() {
  return (
    <Grid>
      <div className="overflow-scroll bg-red-400">
        <table>
          <thead>
            <tr>
              <th>Header 1</th>
              <th>Header 2</th>
              <th>Header 3</th>
              <th>Header 4</th>
              <th>Header 5</th>
              <th>Header 6</th>
              <th>Header 7</th>
              <th>Header 8</th>
              <th>Header 9</th>
              <th>Header 10</th>
              <th>Header 11</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Row 1, Cell 1</td>
              <td>Row 1, Cell 2</td>
            </tr>
            <tr>
              <td>Row 2, Cell 1</td>
              <td>Row 2, Cell 2</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="bg-blue-400">Another Test</div>
      <div className="bg-green-400">Yet Another Test</div>
    </Grid>
  );
}
