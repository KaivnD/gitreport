import { LinearProgress, Grid, Typography } from "@material-ui/core";

export function Loading(props: any) {
  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
      style={{ minHeight: "100vh" }}
    >
      <Typography style={{ margin: 9 }}>加载中 | Loading...</Typography>
      <LinearProgress style={{ width: "42%", height: 2 }} color="primary" />
      <Typography
        variant="subtitle2"
        style={{ height: 18, margin: 6, fontWeight: 200 }}
      >
        {props.msg}
      </Typography>
    </Grid>
  );
}
