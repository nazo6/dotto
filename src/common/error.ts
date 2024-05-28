export class DottoError extends Error {
  static {
    this.prototype.name = "DottoError";
  }
}

/// Error that means user cancelled the operation.
export class DottoUserCancelledError extends DottoError {
  static {
    this.prototype.name = "DottoUserCancelledError";
  }
}

/// Error that means operation is cancelled because of unrecoverable error.
export class DottoCancelledError extends DottoError {
  static {
    this.prototype.name = "DottoCancelledError";
  }
}

/// Error that means config in dotfile is invalid.
export class DottoDotfileError extends DottoError {
  static {
    this.prototype.name = "DottoInvalidDotfileConfigError";
  }
}

/// Generic error that means something went wrong.
export class DottoAnyError extends DottoError {
  static {
    this.prototype.name = "DottoAnyError";
  }
}
