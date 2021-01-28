import ReactEcharts from "echarts-for-react";
import { Async } from "react-async";
import axios from "axios";
import moment from "moment";
import {
  Typography,
  Box,
  Divider,
  Card,
  CardContent,
  GridList,
  GridListTile,
} from "@material-ui/core";

const getDate = (stamp: string, format: string) =>
  moment.unix(parseInt(stamp)).format(format);

export function Report() {
  return (
    <Async
      promiseFn={async () => {
        const report = await axios.get("/report.json");

        const authorOrderByCommits = Object.keys(report.data.authors).sort(
          (a, b) =>
            report.data.authors[b].commits - report.data.authors[a].commits
        );

        let commitsByDateByAuthor: {
          [date: string]: {
            author: string;
            commits: number;
            addLines: number;
          }[];
        } = {};

        const commitsByAuthors: { [author: string]: number } = {};
        const addLinesByAuthors: { [author: string]: number } = {};

        authorOrderByCommits.forEach((author) => {
          commitsByAuthors[author] = 0;
          addLinesByAuthors[author] = 0;
        });

        Object.keys(report.data.changes_by_date_by_author).forEach((stamp) => {
          const date = getDate(stamp, "YYYY-MM-DD");

          authorOrderByCommits.forEach((author) => {
            if (!Object.keys(commitsByDateByAuthor).includes(date))
              commitsByDateByAuthor[date] = [];
            if (
              Object.keys(
                report.data.changes_by_date_by_author[stamp]
              ).includes(author)
            ) {
              const val = report.data.changes_by_date_by_author[stamp][author];
              addLinesByAuthors[author] = val.lines_added;
              commitsByAuthors[author] = val.commits;
            }
            const current = commitsByDateByAuthor[date].find(
              (i) => i.author === author
            );
            if (!current) {
              commitsByDateByAuthor[date].push({
                author,
                addLines: addLinesByAuthors[author],
                commits: commitsByAuthors[author],
              });
              return;
            }
            current.addLines = addLinesByAuthors[author];
            current.commits = commitsByAuthors[author];
          });
        });

        const commits: {
          author: string;
          commits: number[];
          lines: number[];
        }[] = [];

        Object.values(commitsByDateByAuthor).forEach((authors) =>
          authors.forEach((record) => {
            const commit = commits.find(
              (item) => item.author === record.author
            );
            if (!commit)
              commits.push({
                author: record.author,
                commits: [record.commits],
                lines: [record.commits],
              });
            else {
              commit.commits.push(record.commits);
              commit.lines.push(record.addLines);
            }
          })
        );

        const lines: { [date: string]: number } = {};
        const addLines: { [date: string]: number[] } = {};
        const delLines: { [date: string]: number[] } = {};

        Object.keys(report.data.changes_by_date).forEach((date) => {
          const yymmdd = getDate(date, "YYYY-MM-DD");
          if (!Object.keys(addLines).includes(yymmdd)) addLines[yymmdd] = [];
          if (!Object.keys(delLines).includes(yymmdd)) delLines[yymmdd] = [];
          lines[yymmdd] = report.data.changes_by_date[date].lines;
          addLines[yymmdd].push(
            parseInt(report.data.changes_by_date[date].ins)
          );
          delLines[yymmdd].push(
            parseInt(report.data.changes_by_date[date].del)
          );
        });

        return {
          report: report.data,
          commitsByDateByAuthor,
          commits,
          authorOrderByCommits,
          lines,
          addLines,
          delLines,
        };
      }}
    >
      {({ data, error, isPending }) => {
        if (isPending) return "Loading...";
        if (error) return error.message;
        if (data) {
          const totalDays = moment
            .unix(parseInt(data.report.last_commit_stamp))
            .diff(
              moment.unix(parseInt(data.report.first_commit_stamp)),
              "days"
            );
          return (
            <>
              <Box style={{ margin: "48px 0" }}>
                <Typography variant="h2" gutterBottom>
                  NOAH
                </Typography>
                <Divider />
                <Typography variant="h5" gutterBottom style={{ marginTop: 9 }}>
                  项目开发数据统计报告
                </Typography>
              </Box>
              <Box mt={9} mb={6}>
                <GridList cellHeight={138} cols={3}>
                  <GridListTile cols={1}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          统计截止至
                        </Typography>
                        <Typography variant="h5" component="h2">
                          {getDate(data.report.stamp_created, "YYYY-MM-DD")}
                        </Typography>
                        <Typography color="textSecondary">
                          {getDate(data.report.stamp_created, "h:mm:ss a")}
                        </Typography>
                      </CardContent>
                    </Card>
                  </GridListTile>
                  <GridListTile cols={1}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          项目周期
                        </Typography>
                        <Typography variant="h6" component="h2">
                          {getDate(
                            data.report.first_commit_stamp,
                            "YYYY-MM-DD"
                          )}{" "}
                          至{" "}
                          {getDate(data.report.last_commit_stamp, "YYYY-MM-DD")}
                        </Typography>
                        <Typography color="textSecondary">
                          共 {totalDays}天 （{data.report.active_days.length}
                          天活跃，
                          {(
                            (data.report.active_days.length / totalDays) *
                            100
                          ).toFixed(2)}
                          %）
                        </Typography>
                      </CardContent>
                    </Card>
                  </GridListTile>
                  <GridListTile cols={1}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          总行数
                        </Typography>
                        <Typography variant="h5" component="h2">
                          {data.report.total_lines}
                        </Typography>
                        <Typography color="textSecondary">
                          +{data.report.total_lines_added} -
                          {data.report.total_lines_removed}
                        </Typography>
                      </CardContent>
                    </Card>
                  </GridListTile>
                  <GridListTile cols={1}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          文件总数
                        </Typography>
                        <Typography variant="h5" component="h2">
                          {data.report.total_files}
                        </Typography>
                        <Typography color="textSecondary"></Typography>
                      </CardContent>
                    </Card>
                  </GridListTile>
                  <GridListTile cols={1}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          提交次数
                        </Typography>
                        <Typography variant="h5" component="h2">
                          {data.report.total_commits}
                        </Typography>
                        <Typography color="textSecondary"></Typography>
                      </CardContent>
                    </Card>
                  </GridListTile>
                  <GridListTile cols={1}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          版本总数
                        </Typography>
                        <Typography variant="h5" component="h2">
                          {Object.keys(data.report.tags).length}
                        </Typography>
                        <Typography color="textSecondary"></Typography>
                      </CardContent>
                    </Card>
                  </GridListTile>
                </GridList>
              </Box>
              <ReactEcharts
                style={{
                  marginBottom: 30,
                }}
                option={{
                  title: {
                    left: "center",
                    top: "10%",
                    text: "代码总行数变化",
                    subtext: "每个提交的时间点对代码行数对影响",
                  },
                  tooltip: {
                    trigger: "axis",
                  },
                  xAxis: {
                    type: "category",
                    boundaryGap: false,
                    data: Object.keys(data.lines),
                  },
                  yAxis: {
                    type: "value",
                    axisLabel: {
                      formatter: "{value}",
                    },
                  },
                  legend: {
                    data: ["已存行数", "增加行数", "删除行数"],
                  },
                  series: [
                    {
                      name: "已存行数",
                      type: "line",
                      data: Object.values(data.lines),
                    },
                    {
                      name: "增加行数",
                      type: "line",
                      data: Object.values(data.addLines).map(
                        (item) => item.reduce((res, val) => (res += val)),
                        0
                      ),
                    },
                    {
                      name: "删除行数",
                      type: "line",
                      data: Object.values(data.delLines).map(
                        (item) => item.reduce((res, val) => (res += val)),
                        0
                      ),
                    },
                  ],
                }}
              />
              <ReactEcharts
                style={{
                  marginBottom: 30,
                }}
                option={{
                  title: {
                    left: "center",
                    top: "10%",
                    text: "每个小时提交次数",
                    subtext: "总计",
                  },
                  xAxis: {
                    type: "category",
                    data: Object.keys(data.report.activity_by_hour_of_day),
                  },
                  yAxis: {
                    type: "value",
                  },
                  series: [
                    {
                      data: Object.values<number>(
                        data.report.activity_by_hour_of_day
                      ),
                      type: "bar",
                    },
                  ],
                }}
              />

              <ReactEcharts
                style={{
                  marginBottom: 30,
                }}
                option={{
                  title: {
                    left: "center",
                    top: "10%",
                    text: "增加代码行数变化",
                    subtext: "每人总量",
                  },
                  tooltip: {
                    trigger: "axis",
                  },
                  legend: {
                    data: data.authorOrderByCommits,
                  },
                  xAxis: {
                    type: "category",
                    boundaryGap: false,
                    data: Object.keys(data.commitsByDateByAuthor),
                  },
                  yAxis: {
                    type: "value",
                    axisLabel: {
                      formatter: "{value}",
                    },
                  },
                  series: data.commits.map((record) => ({
                    name: record.author,
                    type: "line",
                    data: record.lines,
                  })),
                }}
              />
              <ReactEcharts
                style={{
                  marginBottom: 30,
                }}
                option={{
                  title: {
                    left: "center",
                    top: "10%",
                    text: "提交次数变化",
                    subtext: "一次提交包含多个文件的变化",
                  },
                  tooltip: {
                    trigger: "axis",
                  },
                  legend: {
                    data: data.authorOrderByCommits,
                  },
                  xAxis: {
                    type: "category",
                    boundaryGap: false,
                    data: Object.keys(data.commitsByDateByAuthor),
                  },
                  yAxis: {
                    type: "value",
                    axisLabel: {
                      formatter: "{value}",
                    },
                  },
                  series: data.commits.map((record) => ({
                    name: record.author,
                    type: "line",
                    data: record.commits,
                  })),
                }}
              />
            </>
          );
        }
        return null;
      }}
    </Async>
  );
}
