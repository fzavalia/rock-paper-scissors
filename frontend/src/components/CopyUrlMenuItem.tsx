import React, { Component } from "react";
import { MenuItem } from "@material-ui/core";
import CopyToClipboard from "react-copy-to-clipboard";
import { WithSnackbarProps, withSnackbar } from "notistack";

class CopyUrlMenuItem extends Component<WithSnackbarProps & { onClick: () => void }> {
  onClick = () => {
    this.props.enqueueSnackbar("Link Copied!", { variant: "success" });
    this.props.onClick();
  };

  render = () => {
    return (
      <CopyToClipboard text={window.location.href}>
        <MenuItem onClick={this.onClick}>Copy Link</MenuItem>
      </CopyToClipboard>
    );
  };
}

export default withSnackbar(CopyUrlMenuItem);
