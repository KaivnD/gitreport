import { Suspense } from "react";
import "./App.css";
import { Report } from "./Report";
import { Loading } from "./Loading";
import {
  ThemeProvider,
  createMuiTheme,
  CssBaseline,
  Container,
} from "@material-ui/core";

function App() {
  return (
    <ThemeProvider theme={createMuiTheme()}>
      <CssBaseline />
      <div className="App">
        <Suspense fallback={<Loading />}>
          <Container maxWidth="md">
            <Report />
          </Container>
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;
