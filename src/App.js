import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import Fab from "@material-ui/core/Fab";
import SendIcon from "@material-ui/icons/Send";
import * as PushAPI from "@pushprotocol/restapi";
import { ethers } from "ethers";

import { Button } from "@material-ui/core";

const useStyles = makeStyles({
  table: {},
  chatSection: {
    width: "100%",
    height: "90vh",
    backgroundColor: "#fff",
    boxShadow: "0 1px 2px 0 rgb(145 158 171 / 24%)",
    borderRight: "1px solid #e0e0e0",
    borderLeft: "1px solid #e0e0e0",
    borderBottom: "1px solid #e0e0e0",
    borderRadius: "16px",
  },
  headBG: {
    backgroundColor: "#e0e0e0",
  },
  borderRight500: {
    borderRight: "1px solid #e0e0e0",
  },
  messageArea: {
    height: "60vh",
    overflowY: "auto",
  },
  senderMsgBox: {
    borderRadius: "0px 15px 15px 20px",
    background: "#eee",
    padding: "10px",
  },
  recieveMsgBox: {
    borderRadius: "20px 15px 0 15px",
    background: "aliceblue",
    padding: "10px",
  },
});

function App() {
  const classes = useStyles();
  const [address, setAddress] = useState("");
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectUser, setSelectUser] = useState(null);
  const [userChatMessages, setUserChatMessages] = useState([]);

  const shortAddress = (addr) =>
    addr.length > 10 && addr.startsWith("0x")
      ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
      : addr;

  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);
    setProvider(provider);
    const signer = provider.getSigner();
    console.log(signer, "signer");
    setSigner(signer);

    const address = await signer.getAddress();
    console.log(address, "address");
    setAddress(address);
  };

  return (
    <div className="App">
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h5" className="header-message">
            Chat
          </Typography>
          <Button variant="conained" onClick={connectWallet}>
            Connect Wallet
          </Button>
        </Grid>
      </Grid>
      <Grid container component={Paper} className={classes.chatSection}>
        <Grid item xs={3} className={classes.borderRight500}>
          <List>
            <ListItem button key="RemySharp">
              <ListItemIcon>
                <Avatar sx={{ bgcolor: "orange" }}>M</Avatar>
              </ListItemIcon>
              <ListItemText
                primary={shortAddress(
                  address
                    ? address
                    : "0x3Fe0ab910eA2f59D4E7ee7375FA69Acff238B798"
                )}
                style={{
                  border: "1px solid #eee",
                  padding: "3px 15px",
                  borderRadius: "20px",
                  fontWeight: "bolder",
                }}
              ></ListItemText>
            </ListItem>
          </List>
          <Divider />
          <Grid item xs={12} style={{ padding: "10px" }}>
            <TextField
              id="outlined-basic-email"
              label="Search"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Divider />
          <List>
            {users &&
              users.map((usr, i) => {
                return (
                  <ListItem button key={i}>
                    <ListItemIcon>
                      <Avatar alt={usr?.name} src={usr?.profilePicture} />
                    </ListItemIcon>
                    <ListItemText
                      primary={shortAddress(
                        usr?.wallets?.replace("eip155:", "")
                      )}
                      style={{
                        border: "1px solid #eee",
                        padding: "3px 15px",
                        borderRadius: "20px",
                        fontWeight: "bolder",
                      }}
                    >
                      {shortAddress(usr?.wallets?.replace("eip155:", ""))}
                    </ListItemText>
                    {/* <ListItemText secondary="online" align="right"></ListItemText> */}
                  </ListItem>
                );
              })}
          </List>
        </Grid>
        <ChatBox
          classes={classes}
          receiver={receiver}
          setReceiver={setReceiver}
          message={message}
          setMessage={setMessage}
          userChatMessages={userChatMessages}
          address={address}
        />
      </Grid>
    </div>
  );
}

export default App;

const ChatBox = ({
  classes,
  receiver,
  setReceiver,
  message,
  setMessage,
  userChatMessages,
  address,
}) => {
  return (
    <Grid item xs={9}>
      <List className={classes.messageArea}>
        {userChatMessages &&
          userChatMessages.map((data, i) => {
            return (
              <ListItem key={i}>
                <Grid
                  container
                  style={{
                    display: "grid",
                    justifyContent:
                      data.fromDID == `eip155:${address}` ? "right" : "left",
                  }}
                >
                  <Grid item xs={12}>
                    <ListItemText
                      align="right"
                      style={{
                        textAlign:
                          data.fromDID == `eip155:${address}`
                            ? "right"
                            : "left",
                      }}
                      primary={data?.messageContent}
                    ></ListItemText>
                  </Grid>
                  <Grid item xs={12}>
                    <ListItemText
                      align="right"
                      secondary={Date(data?.timestamp)}
                    ></ListItemText>
                  </Grid>
                </Grid>
              </ListItem>
            );
          })}
      </List>
      <Divider />
      <Grid container style={{ padding: "20px" }}>
        <Grid item xs={6}>
          <TextField
            id="outlined-basic-email"
            label="Receiver Address"
            fullWidth
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
          />
        </Grid>
      </Grid>
      <Grid container style={{ padding: "5px" }}>
        <Grid item xs={11}>
          <TextField
            id="outlined-basic-email"
            label="Message.."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Grid>
        <Grid xs={1} align="right">
          <Fab color="primary" aria-label="add">
            <SendIcon />
          </Fab>
        </Grid>
      </Grid>
    </Grid>
  );
};
