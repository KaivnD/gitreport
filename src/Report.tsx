import ReactEcharts from "echarts-for-react";
import { Async } from "react-async";
import axios from "axios";

export function Report() {
  return (
    <Async
      promiseFn={async () => {
        const report = await axios.get("/report.json");
        let monthAuthor: {
          author: string;
          commits: { [date: string]: number };
        }[] = Object.keys(report.data.authors).map((author) => ({
          author,
          commits: {},
        }));
        Object.keys(report.data.author_of_month).forEach((month) => {
          monthAuthor.forEach(({ author }) => {
            //moment.unix(1584542323).format('YYYY-MM-DD')
            const commit = report.data.author_of_month[month][author];
            const record = monthAuthor.find((item) => item.author === author);
            if (!record) return;
            record.commits[month] = commit ?? 0;
          });
        });

        return { report: report.data, monthAuthor };
      }}
    >
      {({ data, error, isPending }) => {
        if (isPending) return "Loading...";
        if (error) return error.message;
        if (data)
          return (
            <>
              <ReactEcharts
                option={{
                  title: {
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
                option={{
                  title: {
                    text: "每人每月提交次数统计",
                    subtext: "一次提交",
                  },
                  tooltip: {
                    trigger: "axis",
                  },
                  legend: {
                    data: data.monthAuthor.map((item) => item.author),
                  },
                  toolbox: {
                    show: true,
                    feature: {
                      dataZoom: {
                        yAxisIndex: "none",
                      },
                      dataView: { readOnly: false },
                      magicType: { type: ["line", "bar"] },
                      restore: {},
                    },
                  },
                  xAxis: {
                    type: "category",
                    boundaryGap: false,
                    data: Object.keys(data.report.author_of_month),
                    inverse: true,
                  },
                  yAxis: {
                    type: "value",
                    axisLabel: {
                      formatter: "{value}",
                    },
                  },
                  series: data.monthAuthor.map((record) => ({
                    name: record.author,
                    type: "line",
                    data: Object.keys(record.commits).map(
                      (month) => record.commits[month]
                    ),
                  })),
                }}
              />
            </>
          );
        return null;
      }}
    </Async>
  );
}
