import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

function createData(portfolio) {
  let history = [];
  portfolio.Transactions.map((obj) => {
    history.push({
      date: obj.Date,
      investmentPrice: obj.InvestmentPrice,
      quantity: obj.Quantity,
      investedAmount: obj.InvestedAmount,
      currentNav: portfolio.CurrentNav,
      currentGain: obj.CurrentGain,
    });
  });
  let returnObject = {
    fundName: portfolio.FundName,
    history,
  };
  return returnObject;
}

function Row(props) {
  const { row, portfolio } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell onClick={() => setOpen(!open)}>
          <IconButton aria-label="expand row" size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" onClick={() => setOpen(!open)}>
          {row.fundName}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table size="small" aria-label="purchases" className="w-50">
                <TableHead>
                  <TableRow>
                    <TableCell className="font-weight-bold" align="center">
                      Date
                    </TableCell>
                    <TableCell className="font-weight-bold" align="center">
                      Invested Price
                    </TableCell>
                    <TableCell className="font-weight-bold" align="center">
                      Quantity
                    </TableCell>
                    <TableCell className="font-weight-bold" align="center">
                      Invested Amount
                    </TableCell>
                    <TableCell className="font-weight-bold" align="center">
                      Current Price
                    </TableCell>
                    <TableCell className="font-weight-bold" align="center">
                      Overall Gain
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {console.log("portfolio in the Row", portfolio)}
                  {row.history.map((historyRow) => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row" align="center">
                        {historyRow.date}
                      </TableCell>
                      <TableCell align="center">
                        {historyRow.investmentPrice}
                      </TableCell>
                      <TableCell align="center">
                        {historyRow.quantity.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        {historyRow.investedAmount.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        {historyRow.currentNav?.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        {historyRow.currentGain?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const rows = [];

function getRowsData(portfolio) {
  portfolio.map((pf) => {
    rows.push(createData(pf));
  });
}

const getCurrentNav = (fundId) => {
  const fetchedData = fetch("https://api.mfapi.in/mf/" + fundId)
    .then((res) => res.json())
    .then(
      (result) => {
        return Number(result.data[0].nav);
      },
      (error) => {
        console.error("Error", error);
      }
    );
  return fetchedData;
};

const HomePage = () => {
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    fetch(
      "https://my-json-server.typicode.com/Pavan-Varadaraju/mf-tracker-admin/Portfolio"
    )
      .then((res) => res.json())
      .then((res) => {
        res.map((fund, index) => {
          getCurrentNav(fund.FundId).then((nav) => {
            res[index].CurrentNav = nav;
            res[index].Transactions.map((transaction) => {
              transaction.CurrentGain =
                (nav - transaction.InvestmentPrice) * transaction.Quantity;
            });
            // console.log("res", res);
            setPortfolio(res);
            console.log("portfolio", portfolio);
          });
        });
      });
  }, []);

  return (
    <>
      {rows && rows.length === 0 && getRowsData(portfolio)}
      {portfolio && console.log("portfolio in the UI", portfolio)}
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell className="font-weight-bold">
                Portfolio Details
              </TableCell>
              {/* <TableCell align="center" className="font-weight-bold">
                Contributed Amount
              </TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <Row key={row.name} row={row} portfolio={portfolio} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>      
    </>
  );
};

export default HomePage;
