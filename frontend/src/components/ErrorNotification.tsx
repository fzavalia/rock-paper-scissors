import { Component } from "react";
import { withSnackbar, WithSnackbarProps } from "notistack";
import { socket } from "../App";

class ErrorNotification extends Component<WithSnackbarProps> {
  private readonly runtimeError = "runtime-error";

  private onRuntimeError = (e: any) => {
    this.props.enqueueSnackbar(e.error, { variant: "error" });
  };

  componentDidMount = () => {
    socket.on(this.runtimeError, this.onRuntimeError);
  };

  componentWillUnmount = () => {
    socket.off(this.runtimeError, this.onRuntimeError);
  };

  render = () => {
    return this.props.children;
  };
}

export default withSnackbar(ErrorNotification);
