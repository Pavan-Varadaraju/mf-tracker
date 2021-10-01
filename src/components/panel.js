import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Card from "@material-ui/core/Card";
import Table from "react-bootstrap/Table";

const ExpandedComponent = ({ data }) => (
  // <pre>{JSON.stringify(data, null, 2)}</pre>
  <>
    <div className="row m-auto py-2">
      <div className="col">
        NAV: <strong>{data.CurrentNav}</strong>
      </div>
      <div className="col">
        Avg. Buying NAV: <strong>{data.AverageBuyingNav}</strong>
      </div>
      <div className="col">
        Investment: <strong>{data.Investment}</strong>
      </div>
      <div className="col">
        Gain:
        <strong
          className={
            data.CurrentGain - data.Investment > 0
              ? "text-success"
              : "text-danger"
          }
        >
          {(data.CurrentGain - data.Investment).toFixed(2)} (
          {data.CurrentGainPercentage.toFixed(2)} %)
        </strong>
      </div>
      <div className="col">
        Current Value:
        <strong
          className={data.CurrentGain > 0 ? "text-success" : "text-danger"}
        >
          {Number(data.CurrentGain).toFixed(2)}
        </strong>
      </div>
    </div>
    <Table striped bordered hover variant="dark">
      <thead>
        <tr>
          <th>Date</th>
          <th>Invested Amount</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Current Gain</th>
          <th>Current Value</th>
        </tr>
      </thead>
      <tbody>
        {data.Transactions.map((transaction, index) => (
          <>
            <tr>
              <td>{transaction.Date}</td>
              <td>{transaction.InvestedAmount}</td>
              <td>{transaction.InvestmentPrice}</td>
              <td className="text-success">
                {transaction.Quantity.toFixed(2)}
              </td>
              <td
                className={
                  transaction.TransactionGain > 0
                    ? "text-success"
                    : "text-danger"
                }
              >
                <strong>{transaction.TransactionGain}</strong>
              </td>
              <td
                className={
                  data.CurrentNav * transaction.Quantity >
                  transaction.InvestedAmount
                    ? "text-success"
                    : "text-danger"
                }
              >
                {Number(data.CurrentNav * transaction.Quantity).toFixed(2)} (
                {Number(
                  ((data.CurrentNav * transaction.Quantity) /
                    transaction.InvestedAmount -
                    1) *
                    100
                ).toFixed(2)}{" "}
                %)
              </td>
            </tr>
          </>
        ))}
      </tbody>
    </Table>
  </>
);

const Panel = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    fetch(
      "https://my-json-server.typicode.com/Pavan-Varadaraju/mf-tracker-admin/users?FullName=Varadaraju"
    )
      .then((res) => res.json())
      .then((res) => {
        res[0].Portfolio.map((fund, idx) => {
          fetch("https://api.mfapi.in/mf/" + fund.FundId)
            .then((res) => res.json())
            .then(
              (result) => {
                res[0].Portfolio[idx].CurrentNav = Number(
                  result.data[0].nav
                ).toFixed(2);
                res[0].Portfolio[idx].Quantity = 0;
                res[0].Portfolio[idx].Investment = 0;
                res[0].Portfolio[idx].AverageBuyingNav = 0;
                res[0].Portfolio[idx].CurrentGainPercentage = 0;
                fund.Transactions.map((transaction, transIdx) => {
                  res[0].Portfolio[idx].Quantity += transaction.Quantity;
                  res[0].Portfolio[idx].Investment +=
                    transaction.InvestmentPrice * transaction.Quantity;
                  res[0].Portfolio[idx].Transactions[transIdx].TransactionGain =
                    (
                      (
                        res[0].Portfolio[idx].CurrentNav * transaction.Quantity
                      ).toFixed(2) - transaction.InvestedAmount
                    ).toFixed(2);
                  res[0].Portfolio[idx].AverageBuyingNav +=
                    transaction.InvestmentPrice;
                });
                res[0].Portfolio[idx].Quantity = Number(
                  res[0].Portfolio[idx].Quantity
                ).toFixed(2);
                res[0].Portfolio[idx].Investment = Number(
                  res[0].Portfolio[idx].Investment
                ).toFixed(2);
                res[0].Portfolio[idx].CurrentGain = (
                  res[0].Portfolio[idx].CurrentNav *
                  Number(res[0].Portfolio[idx].Quantity)
                ).toFixed(2);
                res[0].Portfolio[idx].CurrentGainPercentage =
                  (res[0].Portfolio[idx].CurrentGain /
                    res[0].Portfolio[idx].Investment -
                    1) *
                  100;
                res[0].Portfolio[idx].AverageBuyingNav = Number(
                  res[0].Portfolio[idx].AverageBuyingNav /
                    fund.Transactions.length
                ).toFixed(2);
                setPortfolio(res[0].Portfolio);
                setColumns([
                  {
                    name: "Fund Name",
                    selector: (row) => row.FundName,
                  },
                  {
                    name: "Current Value",
                    selector: (row) =>
                      row.CurrentGain +
                      "(" +
                      Number(row.CurrentGainPercentage).toFixed(2) +
                      " %)",
                  },
                ]);
                // console.log("res", res[0].Portfolio[idx].CurrentGainPercentage);
              },
              (error) => {
                console.error("Error", error);
              }
            );
        });
      });
  }, []);

  return (
    <>
      <div className="row">
        <div className="col-sm-12 col-md-4 p-4">
         
        </div>
      </div>
      <div className="row">
        <div className="col-md-8 offset-md-2 py-2">
          <Card>
            <DataTable
              columns={columns}
              data={portfolio}
              expandableRows
              expandableRowsComponent={ExpandedComponent}
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default Panel;
