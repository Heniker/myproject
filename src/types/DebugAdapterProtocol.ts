// https://github.com/microsoft/debug-adapter-protocol/tree/master

// all general `string` types in unions were replace with `String` type
// for sole reason of preventing upcasting

export interface ProtocolMessage {
  /**
   * Sequence number (also known as message ID). For protocol messages of type
   * 'request' this ID can be used to cancel the request.
   */
  seq: number

  /**
   * Message type.
   * Values: 'request', 'response', 'event', etc.
   */
  type: 'request' | 'response' | 'event' | String
}

export interface Request extends ProtocolMessage {
  type: 'request'

  /**
   * The command to execute.
   */
  command: string

  /**
   * Object containing arguments for the command.
   */
  arguments?: any
}

export interface Event extends ProtocolMessage {
  type: 'event'

  /**
   * Type of event.
   */
  event: string

  /**
   * Event-specific information.
   */
  body?: any
}

export interface Response extends ProtocolMessage {
  type: 'response'

  /**
   * Sequence number of the corresponding request.
   */
  request_seq: number

  /**
   * Outcome of the request.
   * If true, the request was successful and the 'body' attribute may contain
   * the result of the request.
   * If the value is false, the attribute 'message' contains the error in short
   * form and the 'body' may contain additional information (see
   * 'ErrorResponse.body.error').
   */
  success: boolean

  /**
   * The command requested.
   */
  command: string

  /**
   * Contains the raw error in short form if 'success' is false.
   * This raw error might be interpreted by the frontend and is not shown in the
   * UI.
   * Some predefined values exist.
   * Values:
   * 'cancelled': request was cancelled.
   * etc.
   */
  message?: 'cancelled' | String

  /**
   * Contains request result if success is true and optional error details if
   * success is false.
   */
  body?: any
}

export interface ErrorResponse extends Response {
  body: {
    /**
     * An optional, structured error message.
     */
    error?: Message
  }
}

export interface CancelRequest extends Request {
  command: 'cancel'

  arguments?: CancelArguments
}

export interface CancelArguments {
  /**
   * The ID (attribute 'seq') of the request to cancel. If missing no request is
   * cancelled.
   * Both a 'requestId' and a 'progressId' can be specified in one request.
   */
  requestId?: number

  /**
   * The ID (attribute 'progressId') of the progress to cancel. If missing no
   * progress is cancelled.
   * Both a 'requestId' and a 'progressId' can be specified in one request.
   */
  progressId?: string
}

export interface CancelResponse extends Response {}

export interface InitializedEvent extends Event {
  event: 'initialized'
}

export interface StoppedEvent extends Event {
  event: 'stopped'

  body: {
    /**
     * The reason for the event.
     * For backward compatibility this string is shown in the UI if the
     * 'description' attribute is missing (but it must not be translated).
     * Values: 'step', 'breakpoint', 'exception', 'pause', 'entry', 'goto',
     * 'function breakpoint', 'data breakpoint', 'instruction breakpoint', etc.
     */
    reason:
      | 'step'
      | 'breakpoint'
      | 'exception'
      | 'pause'
      | 'entry'
      | 'goto'
      | 'function breakpoint'
      | 'data breakpoint'
      | 'instruction breakpoint'
      | String

    /**
     * The full reason for the event, e.g. 'Paused on exception'. This string is
     * shown in the UI as is and must be translated.
     */
    description?: string

    /**
     * The thread which was stopped.
     */
    threadId?: number

    /**
     * A value of true hints to the frontend that this event should not change
     * the focus.
     */
    preserveFocusHint?: boolean

    /**
     * Additional information. E.g. if reason is 'exception', text contains the
     * exception name. This string is shown in the UI.
     */
    text?: string

    /**
     * If 'allThreadsStopped' is true, a debug adapter can announce that all
     * threads have stopped.
     * - The client should use this information to enable that all threads can
     * be expanded to access their stacktraces.
     * - If the attribute is missing or false, only the thread with the given
     * threadId can be expanded.
     */
    allThreadsStopped?: boolean
  }
}

export interface ContinuedEvent extends Event {
  event: 'continued'

  body: {
    /**
     * The thread which was continued.
     */
    threadId: number

    /**
     * If 'allThreadsContinued' is true, a debug adapter can announce that all
     * threads have continued.
     */
    allThreadsContinued?: boolean
  }
}

export interface ExitedEvent extends Event {
  event: 'exited'

  body: {
    /**
     * The exit code returned from the debuggee.
     */
    exitCode: number
  }
}

export interface TerminatedEvent extends Event {
  event: 'terminated'

  body?: {
    /**
     * A debug adapter may set 'restart' to true (or to an arbitrary object) to
     * request that the front end restarts the session.
     * The value is not interpreted by the client and passed unmodified as an
     * attribute '__restart' to the 'launch' and 'attach' requests.
     */
    restart?: any
  }
}

export interface ThreadEvent extends Event {
  event: 'thread'

  body: {
    /**
     * The reason for the event.
     * Values: 'started', 'exited', etc.
     */
    reason: 'started' | 'exited' | String

    /**
     * The identifier of the thread.
     */
    threadId: number
  }
}

export interface OutputEvent extends Event {
  event: 'output'

  body: {
    /**
     * The output category. If not specified, 'console' is assumed.
     * Values: 'console', 'stdout', 'stderr', 'telemetry', etc.
     */
    category?: 'console' | 'stdout' | 'stderr' | 'telemetry' | String

    /**
     * The output to report.
     */
    output: string

    /**
     * Support for keeping an output log organized by grouping related messages.
     * Values:
     * 'start': Start a new group in expanded mode. Subsequent output events are
     * members of the group and should be shown indented.
     * The 'output' attribute becomes the name of the group and is not indented.
     * 'startCollapsed': Start a new group in collapsed mode. Subsequent output
     * events are members of the group and should be shown indented (as soon as
     * the group is expanded).
     * The 'output' attribute becomes the name of the group and is not indented.
     * 'end': End the current group and decreases the indentation of subsequent
     * output events.
     * A non empty 'output' attribute is shown as the unindented end of the
     * group.
     * etc.
     */
    group?: 'start' | 'startCollapsed' | 'end'

    /**
     * If an attribute 'variablesReference' exists and its value is > 0, the
     * output contains objects which can be retrieved by passing
     * 'variablesReference' to the 'variables' request. The value should be less
     * than or equal to 2147483647 (2^31-1).
     */
    variablesReference?: number

    /**
     * An optional source location where the output was produced.
     */
    source?: Source

    /**
     * An optional source location line where the output was produced.
     */
    line?: number

    /**
     * An optional source location column where the output was produced.
     */
    column?: number

    /**
     * Optional data to report. For the 'telemetry' category the data will be
     * sent to telemetry, for the other categories the data is shown in JSON
     * format.
     */
    data?: any
  }
}

export interface BreakpointEvent extends Event {
  event: 'breakpoint'

  body: {
    /**
     * The reason for the event.
     * Values: 'changed', 'new', 'removed', etc.
     */
    reason: 'changed' | 'new' | 'removed' | String

    /**
     * The 'id' attribute is used to find the target breakpoint and the other
     * attributes are used as the new values.
     */
    breakpoint: Breakpoint
  }
}

export interface ModuleEvent extends Event {
  event: 'module'

  body: {
    /**
     * The reason for the event.
     * Values: 'new', 'changed', 'removed', etc.
     */
    reason: 'new' | 'changed' | 'removed'

    /**
     * The new, changed, or removed module. In case of 'removed' only the module
     * id is used.
     */
    module: Module
  }
}

export interface LoadedSourceEvent extends Event {
  event: 'loadedSource'

  body: {
    /**
     * The reason for the event.
     * Values: 'new', 'changed', 'removed', etc.
     */
    reason: 'new' | 'changed' | 'removed'

    /**
     * The new, changed, or removed source.
     */
    source: Source
  }
}

export interface ProcessEvent extends Event {
  event: 'process'

  body: {
    /**
     * The logical name of the process. This is usually the full path to
     * process's executable file. Example: /home/example/myproj/program.js.
     */
    name: string

    /**
     * The system process id of the debugged process. This property will be
     * missing for non-system processes.
     */
    systemProcessId?: number

    /**
     * If true, the process is running on the same computer as the debug
     * adapter.
     */
    isLocalProcess?: boolean

    /**
     * Describes how the debug engine started debugging this process.
     * Values:
     * 'launch': Process was launched under the debugger.
     * 'attach': Debugger attached to an existing process.
     * 'attachForSuspendedLaunch': A project launcher component has launched a
     * new process in a suspended state and then asked the debugger to attach.
     * etc.
     */
    startMethod?: 'launch' | 'attach' | 'attachForSuspendedLaunch'

    /**
     * The size of a pointer or address for this process, in bits. This value
     * may be used by clients when formatting addresses for display.
     */
    pointerSize?: number
  }
}

export interface CapabilitiesEvent extends Event {
  event: 'capabilities'

  body: {
    /**
     * The set of updated capabilities.
     */
    capabilities: Capabilities
  }
}

export interface ProgressStartEvent extends Event {
  event: 'progressStart'

  body: {
    /**
     * An ID that must be used in subsequent 'progressUpdate' and 'progressEnd'
     * events to make them refer to the same progress reporting.
     * IDs must be unique within a debug session.
     */
    progressId: string

    /**
     * Mandatory (short) title of the progress reporting. Shown in the UI to
     * describe the long running operation.
     */
    title: string

    /**
     * The request ID that this progress report is related to. If specified a
     * debug adapter is expected to emit
     * progress events for the long running request until the request has been
     * either completed or cancelled.
     * If the request ID is omitted, the progress report is assumed to be
     * related to some general activity of the debug adapter.
     */
    requestId?: number

    /**
     * If true, the request that reports progress may be canceled with a
     * 'cancel' request.
     * So this property basically controls whether the client should use UX that
     * supports cancellation.
     * Clients that don't support cancellation are allowed to ignore the
     * setting.
     */
    cancellable?: boolean

    /**
     * Optional, more detailed progress message.
     */
    message?: string

    /**
     * Optional progress percentage to display (value range: 0 to 100). If
     * omitted no percentage will be shown.
     */
    percentage?: number
  }
}

export interface ProgressUpdateEvent extends Event {
  event: 'progressUpdate'

  body: {
    /**
     * The ID that was introduced in the initial 'progressStart' event.
     */
    progressId: string

    /**
     * Optional, more detailed progress message. If omitted, the previous
     * message (if any) is used.
     */
    message?: string

    /**
     * Optional progress percentage to display (value range: 0 to 100). If
     * omitted no percentage will be shown.
     */
    percentage?: number
  }
}

export interface ProgressEndEvent extends Event {
  event: 'progressEnd'

  body: {
    /**
     * The ID that was introduced in the initial 'ProgressStartEvent'.
     */
    progressId: string

    /**
     * Optional, more detailed progress message. If omitted, the previous
     * message (if any) is used.
     */
    message?: string
  }
}

export interface InvalidatedEvent extends Event {
  event: 'invalidated'

  body: {
    /**
     * Optional set of logical areas that got invalidated. This property has a
     * hint characteristic: a client can only be expected to make a 'best
     * effort' in honouring the areas but there are no guarantees. If this
     * property is missing, empty, or if values are not understand the client
     * should assume a single value 'all'.
     */
    areas?: InvalidatedAreas[]

    /**
     * If specified, the client only needs to refetch data related to this
     * thread.
     */
    threadId?: number

    /**
     * If specified, the client only needs to refetch data related to this stack
     * frame (and the 'threadId' is ignored).
     */
    stackFrameId?: number
  }
}

export interface RunInTerminalRequest extends Request {
  command: 'runInTerminal'

  arguments: RunInTerminalRequestArguments
}

export interface RunInTerminalRequestArguments {
  /**
   * What kind of terminal to launch.
   * Values: 'integrated', 'external', etc.
   */
  kind?: 'integrated' | 'external'

  /**
   * Optional title of the terminal.
   */
  title?: string

  /**
   * Working directory for the command. For non-empty, valid paths this
   * typically results in execution of a change directory command.
   */
  cwd: string

  /**
   * List of arguments. The first argument is the command to run.
   */
  args: string[]

  /**
   * Environment key-value pairs that are added to or removed from the default
   * environment.
   */
  env?: { [key: string]: string | null }
}

export interface RunInTerminalResponse extends Response {
  body: {
    /**
     * The process ID. The value should be less than or equal to 2147483647
     * (2^31-1).
     */
    processId?: number

    /**
     * The process ID of the terminal shell. The value should be less than or
     * equal to 2147483647 (2^31-1).
     */
    shellProcessId?: number
  }
}

export interface InitializeRequest extends Request {
  command: 'initialize'

  arguments: InitializeRequestArguments
}

export interface InitializeRequestArguments {
  /**
   * The ID of the (frontend) client using this adapter.
   */
  clientID?: string

  /**
   * The human readable name of the (frontend) client using this adapter.
   */
  clientName?: string

  /**
   * The ID of the debug adapter.
   */
  adapterID: string

  /**
   * The ISO-639 locale of the (frontend) client using this adapter, e.g. en-US
   * or de-CH.
   */
  locale?: string

  /**
   * If true all line numbers are 1-based (default).
   */
  linesStartAt1?: boolean

  /**
   * If true all column numbers are 1-based (default).
   */
  columnsStartAt1?: boolean

  /**
   * Determines in what format paths are specified. The default is 'path', which
   * is the native format.
   * Values: 'path', 'uri', etc.
   */
  pathFormat?: 'path' | 'uri' | String

  /**
   * Client supports the optional type attribute for variables.
   */
  supportsVariableType?: boolean

  /**
   * Client supports the paging of variables.
   */
  supportsVariablePaging?: boolean

  /**
   * Client supports the runInTerminal request.
   */
  supportsRunInTerminalRequest?: boolean

  /**
   * Client supports memory references.
   */
  supportsMemoryReferences?: boolean

  /**
   * Client supports progress reporting.
   */
  supportsProgressReporting?: boolean

  /**
   * Client supports the invalidated event.
   */
  supportsInvalidatedEvent?: boolean
}

export interface InitializeResponse extends Response {
  /**
   * The capabilities of this debug adapter.
   */
  body?: Capabilities
}

export interface ConfigurationDoneRequest extends Request {
  command: 'configurationDone'

  arguments?: ConfigurationDoneArguments
}

export interface ConfigurationDoneArguments {}

export interface ConfigurationDoneResponse extends Response {}

export interface LaunchRequest extends Request {
  command: 'launch'

  arguments: LaunchRequestArguments
}

export interface LaunchRequestArguments {
  /**
   * If noDebug is true the launch request should launch the program without
   * enabling debugging.
   */
  noDebug?: boolean

  /**
   * Optional data from the previous, restarted session.
   * The data is sent as the 'restart' attribute of the 'terminated' event.
   * The client should leave the data intact.
   */
  __restart?: any
}

export interface LaunchResponse extends Response {}

export interface AttachRequest extends Request {
  command: 'attach'

  arguments: AttachRequestArguments
}

export interface AttachRequestArguments {
  /**
   * Optional data from the previous, restarted session.
   * The data is sent as the 'restart' attribute of the 'terminated' event.
   * The client should leave the data intact.
   */
  __restart?: any
}

export interface AttachResponse extends Response {}

export interface RestartRequest extends Request {
  command: 'restart'

  arguments?: RestartArguments
}

export interface RestartArguments {}

export interface RestartResponse extends Response {}

export interface DisconnectRequest extends Request {
  command: 'disconnect'

  arguments?: DisconnectArguments
}

export interface DisconnectArguments {
  /**
   * A value of true indicates that this 'disconnect' request is part of a
   * restart sequence.
   */
  restart?: boolean

  /**
   * Indicates whether the debuggee should be terminated when the debugger is
   * disconnected.
   * If unspecified, the debug adapter is free to do whatever it thinks is best.
   * The attribute is only honored by a debug adapter if the capability
   * 'supportTerminateDebuggee' is true.
   */
  terminateDebuggee?: boolean
}

export interface DisconnectResponse extends Response {}

export interface TerminateRequest extends Request {
  command: 'terminate'

  arguments?: TerminateArguments
}

export interface TerminateArguments {
  /**
   * A value of true indicates that this 'terminate' request is part of a
   * restart sequence.
   */
  restart?: boolean
}

export interface TerminateResponse extends Response {}

export interface BreakpointLocationsRequest extends Request {
  command: 'breakpointLocations'

  arguments?: BreakpointLocationsArguments
}

export interface BreakpointLocationsArguments {
  /**
   * The source location of the breakpoints; either 'source.path' or
   * 'source.reference' must be specified.
   */
  source: Source

  /**
   * Start line of range to search possible breakpoint locations in. If only the
   * line is specified, the request returns all possible locations in that line.
   */
  line: number

  /**
   * Optional start column of range to search possible breakpoint locations in.
   * If no start column is given, the first column in the start line is assumed.
   */
  column?: number

  /**
   * Optional end line of range to search possible breakpoint locations in. If
   * no end line is given, then the end line is assumed to be the start line.
   */
  endLine?: number

  /**
   * Optional end column of range to search possible breakpoint locations in. If
   * no end column is given, then it is assumed to be in the last column of the
   * end line.
   */
  endColumn?: number
}

export interface BreakpointLocationsResponse extends Response {
  body: {
    /**
     * Sorted set of possible breakpoint locations.
     */
    breakpoints: BreakpointLocation[]
  }
}

export interface SetBreakpointsRequest extends Request {
  command: 'setBreakpoints'

  arguments: SetBreakpointsArguments
}

export interface SetBreakpointsArguments {
  /**
   * The source location of the breakpoints; either 'source.path' or
   * 'source.reference' must be specified.
   */
  source: Source

  /**
   * The code locations of the breakpoints.
   */
  breakpoints?: SourceBreakpoint[]

  /**
   * Deprecated: The code locations of the breakpoints.
   */
  lines?: number[]

  /**
   * A value of true indicates that the underlying source has been modified
   * which results in new breakpoint locations.
   */
  sourceModified?: boolean
}

export interface SetBreakpointsResponse extends Response {
  body: {
    /**
     * Information about the breakpoints.
     * The array elements are in the same order as the elements of the
     * 'breakpoints' (or the deprecated 'lines') array in the arguments.
     */
    breakpoints: Breakpoint[]
  }
}

export interface SetFunctionBreakpointsRequest extends Request {
  command: 'setFunctionBreakpoints'

  arguments: SetFunctionBreakpointsArguments
}

export interface SetFunctionBreakpointsArguments {
  /**
   * The function names of the breakpoints.
   */
  breakpoints: FunctionBreakpoint[]
}

export interface SetFunctionBreakpointsResponse extends Response {
  body: {
    /**
     * Information about the breakpoints. The array elements correspond to the
     * elements of the 'breakpoints' array.
     */
    breakpoints: Breakpoint[]
  }
}

export interface SetExceptionBreakpointsRequest extends Request {
  command: 'setExceptionBreakpoints'

  arguments: SetExceptionBreakpointsArguments
}

export interface SetExceptionBreakpointsArguments {
  /**
   * Set of exception filters specified by their ID. The set of all possible
   * exception filters is defined by the 'exceptionBreakpointFilters'
   * capability. The 'filter' and 'filterOptions' sets are additive.
   */
  filters: string[]

  /**
   * Set of exception filters and their options. The set of all possible
   * exception filters is defined by the 'exceptionBreakpointFilters'
   * capability. This attribute is only honored by a debug adapter if the
   * capability 'supportsExceptionFilterOptions' is true. The 'filter' and
   * 'filterOptions' sets are additive.
   */
  filterOptions?: ExceptionFilterOptions[]

  /**
   * Configuration options for selected exceptions.
   * The attribute is only honored by a debug adapter if the capability
   * 'supportsExceptionOptions' is true.
   */
  exceptionOptions?: ExceptionOptions[]
}

export interface SetExceptionBreakpointsResponse extends Response {}

export interface DataBreakpointInfoRequest extends Request {
  command: 'dataBreakpointInfo'

  arguments: DataBreakpointInfoArguments
}

export interface DataBreakpointInfoArguments {
  /**
   * Reference to the Variable container if the data breakpoint is requested for
   * a child of the container.
   */
  variablesReference?: number

  /**
   * The name of the Variable's child to obtain data breakpoint information for.
   * If variablesReference isn’t provided, this can be an expression.
   */
  name: string
}

export interface DataBreakpointInfoResponse extends Response {
  body: {
    /**
     * An identifier for the data on which a data breakpoint can be registered
     * with the setDataBreakpoints request or null if no data breakpoint is
     * available.
     */
    dataId: string | null

    /**
     * UI string that describes on what data the breakpoint is set on or why a
     * data breakpoint is not available.
     */
    description: string

    /**
     * Optional attribute listing the available access types for a potential
     * data breakpoint. A UI frontend could surface this information.
     */
    accessTypes?: DataBreakpointAccessType[]

    /**
     * Optional attribute indicating that a potential data breakpoint could be
     * persisted across sessions.
     */
    canPersist?: boolean
  }
}

export interface SetDataBreakpointsRequest extends Request {
  command: 'setDataBreakpoints'

  arguments: SetDataBreakpointsArguments
}

export interface SetDataBreakpointsArguments {
  /**
   * The contents of this array replaces all existing data breakpoints. An empty
   * array clears all data breakpoints.
   */
  breakpoints: DataBreakpoint[]
}

export interface SetDataBreakpointsResponse extends Response {
  body: {
    /**
     * Information about the data breakpoints. The array elements correspond to
     * the elements of the input argument 'breakpoints' array.
     */
    breakpoints: Breakpoint[]
  }
}

export interface SetInstructionBreakpointsRequest extends Request {
  command: 'setInstructionBreakpoints'

  arguments: SetInstructionBreakpointsArguments
}

export interface SetInstructionBreakpointsArguments {
  /**
   * The instruction references of the breakpoints
   */
  breakpoints: InstructionBreakpoint[]
}

export interface SetInstructionBreakpointsResponse extends Response {
  body: {
    /**
     * Information about the breakpoints. The array elements correspond to the
     * elements of the 'breakpoints' array.
     */
    breakpoints: Breakpoint[]
  }
}

export interface ContinueRequest extends Request {
  command: 'continue'

  arguments: ContinueArguments
}

export interface ContinueArguments {
  /**
   * Continue execution for the specified thread (if possible).
   * If the backend cannot continue on a single thread but will continue on all
   * threads, it should set the 'allThreadsContinued' attribute in the response
   * to true.
   */
  threadId: number
}

export interface ContinueResponse extends Response {
  body: {
    /**
     * If true, the 'continue' request has ignored the specified thread and
     * continued all threads instead.
     * If this attribute is missing a value of 'true' is assumed for backward
     * compatibility.
     */
    allThreadsContinued?: boolean
  }
}

export interface NextRequest extends Request {
  command: 'next'

  arguments: NextArguments
}

export interface NextArguments {
  /**
   * Execute 'next' for this thread.
   */
  threadId: number

  /**
   * Optional granularity to step. If no granularity is specified, a granularity
   * of 'statement' is assumed.
   */
  granularity?: SteppingGranularity
}

export interface NextResponse extends Response {}

export interface StepInRequest extends Request {
  command: 'stepIn'

  arguments: StepInArguments
}

export interface StepInArguments {
  /**
   * Execute 'stepIn' for this thread.
   */
  threadId: number

  /**
   * Optional id of the target to step into.
   */
  targetId?: number

  /**
   * Optional granularity to step. If no granularity is specified, a granularity
   * of 'statement' is assumed.
   */
  granularity?: SteppingGranularity
}

export interface StepInResponse extends Response {}

export interface StepOutRequest extends Request {
  command: 'stepOut'

  arguments: StepOutArguments
}

export interface StepOutArguments {
  /**
   * Execute 'stepOut' for this thread.
   */
  threadId: number

  /**
   * Optional granularity to step. If no granularity is specified, a granularity
   * of 'statement' is assumed.
   */
  granularity?: SteppingGranularity
}

export interface StepOutResponse extends Response {}

export interface StepBackRequest extends Request {
  command: 'stepBack'

  arguments: StepBackArguments
}

export interface StepBackArguments {
  /**
   * Execute 'stepBack' for this thread.
   */
  threadId: number

  /**
   * Optional granularity to step. If no granularity is specified, a granularity
   * of 'statement' is assumed.
   */
  granularity?: SteppingGranularity
}

export interface StepBackResponse extends Response {}

export interface ReverseContinueRequest extends Request {
  command: 'reverseContinue'

  arguments: ReverseContinueArguments
}

export interface ReverseContinueArguments {
  /**
   * Execute 'reverseContinue' for this thread.
   */
  threadId: number
}

export interface ReverseContinueResponse extends Response {}

export interface RestartFrameRequest extends Request {
  command: 'restartFrame'

  arguments: RestartFrameArguments
}

export interface RestartFrameArguments {
  /**
   * Restart this stackframe.
   */
  frameId: number
}

export interface RestartFrameResponse extends Response {}

export interface GotoRequest extends Request {
  command: 'goto'

  arguments: GotoArguments
}

export interface GotoArguments {
  /**
   * Set the goto target for this thread.
   */
  threadId: number

  /**
   * The location where the debuggee will continue to run.
   */
  targetId: number
}

export interface GotoResponse extends Response {}

export interface PauseRequest extends Request {
  command: 'pause'

  arguments: PauseArguments
}

export interface PauseArguments {
  /**
   * Pause execution for this thread.
   */
  threadId: number
}

export interface PauseResponse extends Response {}

export interface StackTraceRequest extends Request {
  command: 'stackTrace'

  arguments: StackTraceArguments
}

export interface StackTraceArguments {
  /**
   * Retrieve the stacktrace for this thread.
   */
  threadId: number

  /**
   * The index of the first frame to return; if omitted frames start at 0.
   */
  startFrame?: number

  /**
   * The maximum number of frames to return. If levels is not specified or 0,
   * all frames are returned.
   */
  levels?: number

  /**
   * Specifies details on how to format the stack frames.
   * The attribute is only honored by a debug adapter if the capability
   * 'supportsValueFormattingOptions' is true.
   */
  format?: StackFrameFormat
}

export interface StackTraceResponse extends Response {
  body: {
    /**
     * The frames of the stackframe. If the array has length zero, there are no
     * stackframes available.
     * This means that there is no location information available.
     */
    stackFrames: StackFrame[]

    /**
     * The total number of frames available in the stack. If omitted or if
     * totalFrames is larger than the available frames, a client is expected to
     * request frames until a request returns less frames than requested (which
     * indicates the end of the stack). Returning monotonically increasing
     * totalFrames values for subsequent requests can be used to enforce paging
     * in the client.
     */
    totalFrames?: number
  }
}

export interface ScopesRequest extends Request {
  command: 'scopes'

  arguments: ScopesArguments
}

export interface ScopesArguments {
  /**
   * Retrieve the scopes for this stackframe.
   */
  frameId: number
}

export interface ScopesResponse extends Response {
  body: {
    /**
     * The scopes of the stackframe. If the array has length zero, there are no
     * scopes available.
     */
    scopes: Scope[]
  }
}

export interface VariablesRequest extends Request {
  command: 'variables'

  arguments: VariablesArguments
}

export interface VariablesArguments {
  /**
   * The Variable reference.
   */
  variablesReference: number

  /**
   * Optional filter to limit the child variables to either named or indexed. If
   * omitted, both types are fetched.
   * Values: 'indexed', 'named', etc.
   */
  filter?: 'indexed' | 'named'

  /**
   * The index of the first variable to return; if omitted children start at 0.
   */
  start?: number

  /**
   * The number of variables to return. If count is missing or 0, all variables
   * are returned.
   */
  count?: number

  /**
   * Specifies details on how to format the Variable values.
   * The attribute is only honored by a debug adapter if the capability
   * 'supportsValueFormattingOptions' is true.
   */
  format?: ValueFormat
}

export interface VariablesResponse extends Response {
  body: {
    /**
     * All (or a range) of variables for the given variable reference.
     */
    variables: Variable[]
  }
}

export interface SetVariableRequest extends Request {
  command: 'setVariable'

  arguments: SetVariableArguments
}

export interface SetVariableArguments {
  /**
   * The reference of the variable container.
   */
  variablesReference: number

  /**
   * The name of the variable in the container.
   */
  name: string

  /**
   * The value of the variable.
   */
  value: string

  /**
   * Specifies details on how to format the response value.
   */
  format?: ValueFormat
}

export interface SetVariableResponse extends Response {
  body: {
    /**
     * The new value of the variable.
     */
    value: string

    /**
     * The type of the new value. Typically shown in the UI when hovering over
     * the value.
     */
    type?: string

    /**
     * If variablesReference is > 0, the new value is structured and its
     * children can be retrieved by passing variablesReference to the
     * VariablesRequest.
     * The value should be less than or equal to 2147483647 (2^31-1).
     */
    variablesReference?: number

    /**
     * The number of named child variables.
     * The client can use this optional information to present the variables in
     * a paged UI and fetch them in chunks.
     * The value should be less than or equal to 2147483647 (2^31-1).
     */
    namedVariables?: number

    /**
     * The number of indexed child variables.
     * The client can use this optional information to present the variables in
     * a paged UI and fetch them in chunks.
     * The value should be less than or equal to 2147483647 (2^31-1).
     */
    indexedVariables?: number
  }
}

export interface SourceRequest extends Request {
  command: 'source'

  arguments: SourceArguments
}

export interface SourceArguments {
  /**
   * Specifies the source content to load. Either source.path or
   * source.sourceReference must be specified.
   */
  source?: Source

  /**
   * The reference to the source. This is the same as source.sourceReference.
   * This is provided for backward compatibility since old backends do not
   * understand the 'source' attribute.
   */
  sourceReference: number
}

export interface SourceResponse extends Response {
  body: {
    /**
     * Content of the source reference.
     */
    content: string

    /**
     * Optional content type (mime type) of the source.
     */
    mimeType?: string
  }
}

export interface ThreadsRequest extends Request {
  command: 'threads'
}

export interface ThreadsResponse extends Response {
  body: {
    /**
     * All threads.
     */
    threads: Thread[]
  }
}

export interface TerminateThreadsRequest extends Request {
  command: 'terminateThreads'

  arguments: TerminateThreadsArguments
}

export interface TerminateThreadsArguments {
  /**
   * Ids of threads to be terminated.
   */
  threadIds?: number[]
}

export interface TerminateThreadsResponse extends Response {}

export interface ModulesRequest extends Request {
  command: 'modules'

  arguments: ModulesArguments
}

export interface ModulesArguments {
  /**
   * The index of the first module to return; if omitted modules start at 0.
   */
  startModule?: number

  /**
   * The number of modules to return. If moduleCount is not specified or 0, all
   * modules are returned.
   */
  moduleCount?: number
}

export interface ModulesResponse extends Response {
  body: {
    /**
     * All modules or range of modules.
     */
    modules: Module[]

    /**
     * The total number of modules available.
     */
    totalModules?: number
  }
}

export interface LoadedSourcesRequest extends Request {
  command: 'loadedSources'

  arguments?: LoadedSourcesArguments
}

export interface LoadedSourcesArguments {}

export interface LoadedSourcesResponse extends Response {
  body: {
    /**
     * Set of loaded sources.
     */
    sources: Source[]
  }
}

export interface EvaluateRequest extends Request {
  command: 'evaluate'

  arguments: EvaluateArguments
}

export interface EvaluateArguments {
  /**
   * The expression to evaluate.
   */
  expression: string

  /**
   * Evaluate the expression in the scope of this stack frame. If not specified,
   * the expression is evaluated in the global scope.
   */
  frameId?: number

  /**
   * The context in which the evaluate request is run.
   * Values:
   * 'watch': evaluate is run in a watch.
   * 'repl': evaluate is run from REPL console.
   * 'hover': evaluate is run from a data hover.
   * 'clipboard': evaluate is run to generate the value that will be stored in
   * the clipboard.
   * The attribute is only honored by a debug adapter if the capability
   * 'supportsClipboardContext' is true.
   * etc.
   */
  context?: 'watch' | 'repl' | 'hover' | 'clipboard' | String

  /**
   * Specifies details on how to format the Evaluate result.
   * The attribute is only honored by a debug adapter if the capability
   * 'supportsValueFormattingOptions' is true.
   */
  format?: ValueFormat
}

export interface EvaluateResponse extends Response {
  body: {
    /**
     * The result of the evaluate request.
     */
    result: string

    /**
     * The optional type of the evaluate result.
     * This attribute should only be returned by a debug adapter if the client
     * has passed the value true for the 'supportsVariableType' capability of
     * the 'initialize' request.
     */
    type?: string

    /**
     * Properties of a evaluate result that can be used to determine how to
     * render the result in the UI.
     */
    presentationHint?: VariablePresentationHint

    /**
     * If variablesReference is > 0, the evaluate result is structured and its
     * children can be retrieved by passing variablesReference to the
     * VariablesRequest.
     * The value should be less than or equal to 2147483647 (2^31-1).
     */
    variablesReference: number

    /**
     * The number of named child variables.
     * The client can use this optional information to present the variables in
     * a paged UI and fetch them in chunks.
     * The value should be less than or equal to 2147483647 (2^31-1).
     */
    namedVariables?: number

    /**
     * The number of indexed child variables.
     * The client can use this optional information to present the variables in
     * a paged UI and fetch them in chunks.
     * The value should be less than or equal to 2147483647 (2^31-1).
     */
    indexedVariables?: number

    /**
     * Optional memory reference to a location appropriate for this result.
     * For pointer type eval results, this is generally a reference to the
     * memory address contained in the pointer.
     * This attribute should be returned by a debug adapter if the client has
     * passed the value true for the 'supportsMemoryReferences' capability of
     * the 'initialize' request.
     */
    memoryReference?: string
  }
}

export interface SetExpressionRequest extends Request {
  command: 'setExpression'

  arguments: SetExpressionArguments
}

export interface SetExpressionArguments {
  /**
   * The l-value expression to assign to.
   */
  expression: string

  /**
   * The value expression to assign to the l-value expression.
   */
  value: string

  /**
   * Evaluate the expressions in the scope of this stack frame. If not
   * specified, the expressions are evaluated in the global scope.
   */
  frameId?: number

  /**
   * Specifies how the resulting value should be formatted.
   */
  format?: ValueFormat
}

export interface SetExpressionResponse extends Response {
  body: {
    /**
     * The new value of the expression.
     */
    value: string

    /**
     * The optional type of the value.
     * This attribute should only be returned by a debug adapter if the client
     * has passed the value true for the 'supportsVariableType' capability of
     * the 'initialize' request.
     */
    type?: string

    /**
     * Properties of a value that can be used to determine how to render the
     * result in the UI.
     */
    presentationHint?: VariablePresentationHint

    /**
     * If variablesReference is > 0, the value is structured and its children
     * can be retrieved by passing variablesReference to the VariablesRequest.
     * The value should be less than or equal to 2147483647 (2^31-1).
     */
    variablesReference?: number

    /**
     * The number of named child variables.
     * The client can use this optional information to present the variables in
     * a paged UI and fetch them in chunks.
     * The value should be less than or equal to 2147483647 (2^31-1).
     */
    namedVariables?: number

    /**
     * The number of indexed child variables.
     * The client can use this optional information to present the variables in
     * a paged UI and fetch them in chunks.
     * The value should be less than or equal to 2147483647 (2^31-1).
     */
    indexedVariables?: number
  }
}

export interface StepInTargetsRequest extends Request {
  command: 'stepInTargets'

  arguments: StepInTargetsArguments
}

export interface StepInTargetsArguments {
  /**
   * The stack frame for which to retrieve the possible stepIn targets.
   */
  frameId: number
}

export interface StepInTargetsResponse extends Response {
  body: {
    /**
     * The possible stepIn targets of the specified source location.
     */
    targets: StepInTarget[]
  }
}

export interface GotoTargetsRequest extends Request {
  command: 'gotoTargets'

  arguments: GotoTargetsArguments
}

export interface GotoTargetsArguments {
  /**
   * The source location for which the goto targets are determined.
   */
  source: Source

  /**
   * The line location for which the goto targets are determined.
   */
  line: number

  /**
   * An optional column location for which the goto targets are determined.
   */
  column?: number
}

export interface GotoTargetsResponse extends Response {
  body: {
    /**
     * The possible goto targets of the specified location.
     */
    targets: GotoTarget[]
  }
}

export interface CompletionsRequest extends Request {
  command: 'completions'

  arguments: CompletionsArguments
}

export interface CompletionsArguments {
  /**
   * Returns completions in the scope of this stack frame. If not specified, the
   * completions are returned for the global scope.
   */
  frameId?: number

  /**
   * One or more source lines. Typically this is the text a user has typed into
   * the debug console before he asked for completion.
   */
  text: string

  /**
   * The character position for which to determine the completion proposals.
   */
  column: number

  /**
   * An optional line for which to determine the completion proposals. If
   * missing the first line of the text is assumed.
   */
  line?: number
}

export interface CompletionsResponse extends Response {
  body: {
    /**
     * The possible completions for .
     */
    targets: CompletionItem[]
  }
}

export interface ExceptionInfoRequest extends Request {
  command: 'exceptionInfo'

  arguments: ExceptionInfoArguments
}

export interface ExceptionInfoArguments {
  /**
   * Thread for which exception information should be retrieved.
   */
  threadId: number
}

export interface ExceptionInfoResponse extends Response {
  body: {
    /**
     * ID of the exception that was thrown.
     */
    exceptionId: string

    /**
     * Descriptive text for the exception provided by the debug adapter.
     */
    description?: string

    /**
     * Mode that caused the exception notification to be raised.
     */
    breakMode: ExceptionBreakMode

    /**
     * Detailed information about the exception.
     */
    details?: ExceptionDetails
  }
}

export interface ReadMemoryRequest extends Request {
  command: 'readMemory'

  arguments: ReadMemoryArguments
}

export interface ReadMemoryArguments {
  /**
   * Memory reference to the base location from which data should be read.
   */
  memoryReference: string

  /**
   * Optional offset (in bytes) to be applied to the reference location before
   * reading data. Can be negative.
   */
  offset?: number

  /**
   * Number of bytes to read at the specified location and offset.
   */
  count: number
}

export interface ReadMemoryResponse extends Response {
  body?: {
    /**
     * The address of the first byte of data returned.
     * Treated as a hex value if prefixed with '0x', or as a decimal value
     * otherwise.
     */
    address: string

    /**
     * The number of unreadable bytes encountered after the last successfully
     * read byte.
     * This can be used to determine the number of bytes that must be skipped
     * before a subsequent 'readMemory' request will succeed.
     */
    unreadableBytes?: number

    /**
     * The bytes read from memory, encoded using base64.
     */
    data?: string
  }
}

export interface DisassembleRequest extends Request {
  command: 'disassemble'

  arguments: DisassembleArguments
}

export interface DisassembleArguments {
  /**
   * Memory reference to the base location containing the instructions to
   * disassemble.
   */
  memoryReference: string

  /**
   * Optional offset (in bytes) to be applied to the reference location before
   * disassembling. Can be negative.
   */
  offset?: number

  /**
   * Optional offset (in instructions) to be applied after the byte offset (if
   * any) before disassembling. Can be negative.
   */
  instructionOffset?: number

  /**
   * Number of instructions to disassemble starting at the specified location
   * and offset.
   * An adapter must return exactly this number of instructions - any
   * unavailable instructions should be replaced with an implementation-defined
   * 'invalid instruction' value.
   */
  instructionCount: number

  /**
   * If true, the adapter should attempt to resolve memory addresses and other
   * values to symbolic names.
   */
  resolveSymbols?: boolean
}

export interface DisassembleResponse extends Response {
  body?: {
    /**
     * The list of disassembled instructions.
     */
    instructions: DisassembledInstruction[]
  }
}

export interface Capabilities {
  /**
   * The debug adapter supports the 'configurationDone' request.
   */
  supportsConfigurationDoneRequest?: boolean

  /**
   * The debug adapter supports function breakpoints.
   */
  supportsFunctionBreakpoints?: boolean

  /**
   * The debug adapter supports conditional breakpoints.
   */
  supportsConditionalBreakpoints?: boolean

  /**
   * The debug adapter supports breakpoints that break execution after a
   * specified number of hits.
   */
  supportsHitConditionalBreakpoints?: boolean

  /**
   * The debug adapter supports a (side effect free) evaluate request for data
   * hovers.
   */
  supportsEvaluateForHovers?: boolean

  /**
   * Available exception filter options for the 'setExceptionBreakpoints'
   * request.
   */
  exceptionBreakpointFilters?: ExceptionBreakpointsFilter[]

  /**
   * The debug adapter supports stepping back via the 'stepBack' and
   * 'reverseContinue' requests.
   */
  supportsStepBack?: boolean

  /**
   * The debug adapter supports setting a variable to a value.
   */
  supportsSetVariable?: boolean

  /**
   * The debug adapter supports restarting a frame.
   */
  supportsRestartFrame?: boolean

  /**
   * The debug adapter supports the 'gotoTargets' request.
   */
  supportsGotoTargetsRequest?: boolean

  /**
   * The debug adapter supports the 'stepInTargets' request.
   */
  supportsStepInTargetsRequest?: boolean

  /**
   * The debug adapter supports the 'completions' request.
   */
  supportsCompletionsRequest?: boolean

  /**
   * The set of characters that should trigger completion in a REPL. If not
   * specified, the UI should assume the '.' character.
   */
  completionTriggerCharacters?: string[]

  /**
   * The debug adapter supports the 'modules' request.
   */
  supportsModulesRequest?: boolean

  /**
   * The set of additional module information exposed by the debug adapter.
   */
  additionalModuleColumns?: ColumnDescriptor[]

  /**
   * Checksum algorithms supported by the debug adapter.
   */
  supportedChecksumAlgorithms?: ChecksumAlgorithm[]

  /**
   * The debug adapter supports the 'restart' request. In this case a client
   * should not implement 'restart' by terminating and relaunching the adapter
   * but by calling the RestartRequest.
   */
  supportsRestartRequest?: boolean

  /**
   * The debug adapter supports 'exceptionOptions' on the
   * setExceptionBreakpoints request.
   */
  supportsExceptionOptions?: boolean

  /**
   * The debug adapter supports a 'format' attribute on the stackTraceRequest,
   * variablesRequest, and evaluateRequest.
   */
  supportsValueFormattingOptions?: boolean

  /**
   * The debug adapter supports the 'exceptionInfo' request.
   */
  supportsExceptionInfoRequest?: boolean

  /**
   * The debug adapter supports the 'terminateDebuggee' attribute on the
   * 'disconnect' request.
   */
  supportTerminateDebuggee?: boolean

  /**
   * The debug adapter supports the delayed loading of parts of the stack, which
   * requires that both the 'startFrame' and 'levels' arguments and an optional
   * 'totalFrames' result of the 'StackTrace' request are supported.
   */
  supportsDelayedStackTraceLoading?: boolean

  /**
   * The debug adapter supports the 'loadedSources' request.
   */
  supportsLoadedSourcesRequest?: boolean

  /**
   * The debug adapter supports logpoints by interpreting the 'logMessage'
   * attribute of the SourceBreakpoint.
   */
  supportsLogPoints?: boolean

  /**
   * The debug adapter supports the 'terminateThreads' request.
   */
  supportsTerminateThreadsRequest?: boolean

  /**
   * The debug adapter supports the 'setExpression' request.
   */
  supportsSetExpression?: boolean

  /**
   * The debug adapter supports the 'terminate' request.
   */
  supportsTerminateRequest?: boolean

  /**
   * The debug adapter supports data breakpoints.
   */
  supportsDataBreakpoints?: boolean

  /**
   * The debug adapter supports the 'readMemory' request.
   */
  supportsReadMemoryRequest?: boolean

  /**
   * The debug adapter supports the 'disassemble' request.
   */
  supportsDisassembleRequest?: boolean

  /**
   * The debug adapter supports the 'cancel' request.
   */
  supportsCancelRequest?: boolean

  /**
   * The debug adapter supports the 'breakpointLocations' request.
   */
  supportsBreakpointLocationsRequest?: boolean

  /**
   * The debug adapter supports the 'clipboard' context value in the 'evaluate'
   * request.
   */
  supportsClipboardContext?: boolean

  /**
   * The debug adapter supports stepping granularities (argument 'granularity')
   * for the stepping requests.
   */
  supportsSteppingGranularity?: boolean

  /**
   * The debug adapter supports adding breakpoints based on instruction
   * references.
   */
  supportsInstructionBreakpoints?: boolean

  /**
   * The debug adapter supports 'filterOptions' as an argument on the
   * 'setExceptionBreakpoints' request.
   */
  supportsExceptionFilterOptions?: boolean
}

export interface ExceptionBreakpointsFilter {
  /**
   * The internal ID of the filter option. This value is passed to the
   * 'setExceptionBreakpoints' request.
   */
  filter: string

  /**
   * The name of the filter option. This will be shown in the UI.
   */
  label: string

  /**
   * An optional help text providing additional information about the exception
   * filter. This string is typically shown as a hover and must be translated.
   */
  description?: string

  /**
   * Initial value of the filter option. If not specified a value 'false' is
   * assumed.
   */
  default?: boolean

  /**
   * Controls whether a condition can be specified for this filter option. If
   * false or missing, a condition can not be set.
   */
  supportsCondition?: boolean

  /**
   * An optional help text providing information about the condition. This
   * string is shown as the placeholder text for a text box and must be
   * translated.
   */
  conditionDescription?: string
}

export interface Message {
  /**
   * Unique identifier for the message.
   */
  id: number

  /**
   * A format string for the message. Embedded variables have the form '{name}'.
   * If variable name starts with an underscore character, the variable does not
   * contain user data (PII) and can be safely used for telemetry purposes.
   */
  format: string

  /**
   * An object used as a dictionary for looking up the variables in the format
   * string.
   */
  variables?: { [key: string]: string }

  /**
   * If true send to telemetry.
   */
  sendTelemetry?: boolean

  /**
   * If true show user.
   */
  showUser?: boolean

  /**
   * An optional url where additional information about this message can be
   * found.
   */
  url?: string

  /**
   * An optional label that is presented to the user as the UI for opening the
   * url.
   */
  urlLabel?: string
}

export interface Module {
  /**
   * Unique identifier for the module.
   */
  id: number | String

  /**
   * A name of the module.
   */
  name: string

  /**
   * optional but recommended attributes.
   * always try to use these first before introducing additional attributes.
   *
   * Logical full path to the module. The exact definition is implementation
   * defined, but usually this would be a full path to the on-disk file for the
   * module.
   */
  path?: string

  /**
   * True if the module is optimized.
   */
  isOptimized?: boolean

  /**
   * True if the module is considered 'user code' by a debugger that supports
   * 'Just My Code'.
   */
  isUserCode?: boolean

  /**
   * Version of Module.
   */
  version?: string

  /**
   * User understandable description of if symbols were found for the module
   * (ex: 'Symbols Loaded', 'Symbols not found', etc.
   */
  symbolStatus?: string

  /**
   * Logical full path to the symbol file. The exact definition is
   * implementation defined.
   */
  symbolFilePath?: string

  /**
   * Module created or modified.
   */
  dateTimeStamp?: string

  /**
   * Address range covered by this module.
   */
  addressRange?: string
}

export interface ColumnDescriptor {
  /**
   * Name of the attribute rendered in this column.
   */
  attributeName: string

  /**
   * Header UI label of column.
   */
  label: string

  /**
   * Format to use for the rendered values in this column. TBD how the format
   * strings looks like.
   */
  format?: string

  /**
   * Datatype of values in this column.  Defaults to 'string' if not specified.
   * Values: 'string', 'number', 'boolean', 'unixTimestampUTC', etc.
   */
  type?: 'string' | 'number' | 'boolean' | 'unixTimestampUTC'

  /**
   * Width of this column in characters (hint only).
   */
  width?: number
}

export interface ModulesViewDescriptor {
  columns: ColumnDescriptor[]
}

export interface Thread {
  /**
   * Unique identifier for the thread.
   */
  id: number

  /**
   * A name of the thread.
   */
  name: string
}

export interface Source {
  /**
   * The short name of the source. Every source returned from the debug adapter
   * has a name.
   * When sending a source to the debug adapter this name is optional.
   */
  name?: string

  /**
   * The path of the source to be shown in the UI.
   * It is only used to locate and load the content of the source if no
   * sourceReference is specified (or its value is 0).
   */
  path?: string

  /**
   * If sourceReference > 0 the contents of the source must be retrieved through
   * the SourceRequest (even if a path is specified).
   * A sourceReference is only valid for a session, so it must not be used to
   * persist a source.
   * The value should be less than or equal to 2147483647 (2^31-1).
   */
  sourceReference?: number

  /**
   * An optional hint for how to present the source in the UI.
   * A value of 'deemphasize' can be used to indicate that the source is not
   * available or that it is skipped on stepping.
   * Values: 'normal', 'emphasize', 'deemphasize', etc.
   */
  presentationHint?: 'normal' | 'emphasize' | 'deemphasize'

  /**
   * The (optional) origin of this source: possible values 'internal module',
   * 'inlined content from source map', etc.
   */
  origin?: string

  /**
   * An optional list of sources that are related to this source. These may be
   * the source that generated this source.
   */
  sources?: Source[]

  /**
   * Optional data that a debug adapter might want to loop through the client.
   * The client should leave the data intact and persist it across sessions. The
   * client should not interpret the data.
   */
  adapterData?: any

  /**
   * The checksums associated with this file.
   */
  checksums?: Checksum[]
}

export interface StackFrame {
  /**
   * An identifier for the stack frame. It must be unique across all threads.
   * This id can be used to retrieve the scopes of the frame with the
   * 'scopesRequest' or to restart the execution of a stackframe.
   */
  id: number

  /**
   * The name of the stack frame, typically a method name.
   */
  name: string

  /**
   * The optional source of the frame.
   */
  source?: Source

  /**
   * The line within the file of the frame. If source is null or doesn't exist,
   * line is 0 and must be ignored.
   */
  line: number

  /**
   * The column within the line. If source is null or doesn't exist, column is 0
   * and must be ignored.
   */
  column: number

  /**
   * An optional end line of the range covered by the stack frame.
   */
  endLine?: number

  /**
   * An optional end column of the range covered by the stack frame.
   */
  endColumn?: number

  /**
   * Indicates whether this frame can be restarted with the 'restart' request.
   * Clients should only use this if the debug adapter supports the 'restart'
   * request (capability 'supportsRestartRequest' is true).
   */
  canRestart?: boolean

  /**
   * Optional memory reference for the current instruction pointer in this
   * frame.
   */
  instructionPointerReference?: string

  /**
   * The module associated with this frame, if any.
   */
  moduleId?: number | String

  /**
   * An optional hint for how to present this frame in the UI.
   * A value of 'label' can be used to indicate that the frame is an artificial
   * frame that is used as a visual label or separator. A value of 'subtle' can
   * be used to change the appearance of a frame in a 'subtle' way.
   * Values: 'normal', 'label', 'subtle', etc.
   */
  presentationHint?: 'normal' | 'label' | 'subtle'
}

export interface Scope {
  /**
   * Name of the scope such as 'Arguments', 'Locals', or 'Registers'. This
   * string is shown in the UI as is and can be translated.
   */
  name: string

  /**
   * An optional hint for how to present this scope in the UI. If this attribute
   * is missing, the scope is shown with a generic UI.
   * Values:
   * 'arguments': Scope contains method arguments.
   * 'locals': Scope contains local variables.
   * 'registers': Scope contains registers. Only a single 'registers' scope
   * should be returned from a 'scopes' request.
   * etc.
   */
  presentationHint?: 'arguments' | 'locals' | 'registers' | String

  /**
   * The variables of this scope can be retrieved by passing the value of
   * variablesReference to the VariablesRequest.
   */
  variablesReference: number

  /**
   * The number of named variables in this scope.
   * The client can use this optional information to present the variables in a
   * paged UI and fetch them in chunks.
   */
  namedVariables?: number

  /**
   * The number of indexed variables in this scope.
   * The client can use this optional information to present the variables in a
   * paged UI and fetch them in chunks.
   */
  indexedVariables?: number

  /**
   * If true, the number of variables in this scope is large or expensive to
   * retrieve.
   */
  expensive: boolean

  /**
   * Optional source for this scope.
   */
  source?: Source

  /**
   * Optional start line of the range covered by this scope.
   */
  line?: number

  /**
   * Optional start column of the range covered by this scope.
   */
  column?: number

  /**
   * Optional end line of the range covered by this scope.
   */
  endLine?: number

  /**
   * Optional end column of the range covered by this scope.
   */
  endColumn?: number
}

export interface Variable {
  /**
   * The variable's name.
   */
  name: string

  /**
   * The variable's value. This can be a multi-line text, e.g. for a function
   * the body of a function.
   */
  value: string

  /**
   * The type of the variable's value. Typically shown in the UI when hovering
   * over the value.
   * This attribute should only be returned by a debug adapter if the client has
   * passed the value true for the 'supportsVariableType' capability of the
   * 'initialize' request.
   */
  type?: string

  /**
   * Properties of a variable that can be used to determine how to render the
   * variable in the UI.
   */
  presentationHint?: VariablePresentationHint

  /**
   * Optional evaluatable name of this variable which can be passed to the
   * 'EvaluateRequest' to fetch the variable's value.
   */
  evaluateName?: string

  /**
   * If variablesReference is > 0, the variable is structured and its children
   * can be retrieved by passing variablesReference to the VariablesRequest.
   */
  variablesReference: number

  /**
   * The number of named child variables.
   * The client can use this optional information to present the children in a
   * paged UI and fetch them in chunks.
   */
  namedVariables?: number

  /**
   * The number of indexed child variables.
   * The client can use this optional information to present the children in a
   * paged UI and fetch them in chunks.
   */
  indexedVariables?: number

  /**
   * Optional memory reference for the variable if the variable represents
   * executable code, such as a function pointer.
   * This attribute is only required if the client has passed the value true for
   * the 'supportsMemoryReferences' capability of the 'initialize' request.
   */
  memoryReference?: string
}

export interface VariablePresentationHint {
  /**
   * The kind of variable. Before introducing additional values, try to use the
   * listed values.
   * Values:
   * 'property': Indicates that the object is a property.
   * 'method': Indicates that the object is a method.
   * 'class': Indicates that the object is a class.
   * 'data': Indicates that the object is data.
   * 'event': Indicates that the object is an event.
   * 'baseClass': Indicates that the object is a base class.
   * 'innerClass': Indicates that the object is an inner class.
   * 'export interface': Indicates that the object is an export interface.
   * 'mostDerivedClass': Indicates that the object is the most derived class.
   * 'virtual': Indicates that the object is virtual, that means it is a
   * synthetic object introducedby the
   * adapter for rendering purposes, e.g. an index range for large arrays.
   * 'dataBreakpoint': Deprecated: Indicates that a data breakpoint is
   * registered for the object. The 'hasDataBreakpoint' attribute should
   * generally be used instead.
   * etc.
   */
  kind?:
    | 'property'
    | 'method'
    | 'class'
    | 'data'
    | 'event'
    | 'baseClass'
    | 'innerClass'
    | 'export interface'
    | 'mostDerivedClass'
    | 'virtual'
    | 'dataBreakpoint'
    | String

  /**
   * Set of attributes represented as an array of strings. Before introducing
   * additional values, try to use the listed values.
   * Values:
   * 'static': Indicates that the object is static.
   * 'constant': Indicates that the object is a constant.
   * 'readOnly': Indicates that the object is read only.
   * 'rawString': Indicates that the object is a raw string.
   * 'hasObjectId': Indicates that the object can have an Object ID created for
   * it.
   * 'canHaveObjectId': Indicates that the object has an Object ID associated
   * with it.
   * 'hasSideEffects': Indicates that the evaluation had side effects.
   * 'hasDataBreakpoint': Indicates that the object has its value tracked by a
   * data breakpoint.
   * etc.
   */
  attributes?: (
    | 'static'
    | 'constant'
    | 'readOnly'
    | 'rawString'
    | 'hasObjectId'
    | 'canHaveObjectId'
    | 'hasSideEffects'
    | 'hasDataBreakpoint'
    | String
  )[]

  /**
   * Visibility of variable. Before introducing additional values, try to use
   * the listed values.
   * Values: 'public', 'private', 'protected', 'internal', 'final', etc.
   */
  visibility?: 'public' | 'private' | 'protected' | 'internal' | 'final' | String
}

export interface BreakpointLocation {
  /**
   * Start line of breakpoint location.
   */
  line: number

  /**
   * Optional start column of breakpoint location.
   */
  column?: number

  /**
   * Optional end line of breakpoint location if the location covers a range.
   */
  endLine?: number

  /**
   * Optional end column of breakpoint location if the location covers a range.
   */
  endColumn?: number
}

export interface SourceBreakpoint {
  /**
   * The source line of the breakpoint or logpoint.
   */
  line: number

  /**
   * An optional source column of the breakpoint.
   */
  column?: number

  /**
   * An optional expression for conditional breakpoints.
   * It is only honored by a debug adapter if the capability
   * 'supportsConditionalBreakpoints' is true.
   */
  condition?: string

  /**
   * An optional expression that controls how many hits of the breakpoint are
   * ignored.
   * The backend is expected to interpret the expression as needed.
   * The attribute is only honored by a debug adapter if the capability
   * 'supportsHitConditionalBreakpoints' is true.
   */
  hitCondition?: string

  /**
   * If this attribute exists and is non-empty, the backend must not 'break'
   * (stop)
   * but log the message instead. Expressions within {} are interpolated.
   * The attribute is only honored by a debug adapter if the capability
   * 'supportsLogPoints' is true.
   */
  logMessage?: string
}

export interface FunctionBreakpoint {
  /**
   * The name of the function.
   */
  name: string

  /**
   * An optional expression for conditional breakpoints.
   * It is only honored by a debug adapter if the capability
   * 'supportsConditionalBreakpoints' is true.
   */
  condition?: string

  /**
   * An optional expression that controls how many hits of the breakpoint are
   * ignored.
   * The backend is expected to interpret the expression as needed.
   * The attribute is only honored by a debug adapter if the capability
   * 'supportsHitConditionalBreakpoints' is true.
   */
  hitCondition?: string
}

type DataBreakpointAccessType = 'read' | 'write' | 'readWrite'

export interface DataBreakpoint {
  /**
   * An id representing the data. This id is returned from the
   * dataBreakpointInfo request.
   */
  dataId: string

  /**
   * The access type of the data.
   */
  accessType?: DataBreakpointAccessType

  /**
   * An optional expression for conditional breakpoints.
   */
  condition?: string

  /**
   * An optional expression that controls how many hits of the breakpoint are
   * ignored.
   * The backend is expected to interpret the expression as needed.
   */
  hitCondition?: string
}

export interface InstructionBreakpoint {
  /**
   * The instruction reference of the breakpoint.
   * This should be a memory or instruction pointer reference from an
   * EvaluateResponse, Variable, StackFrame, GotoTarget, or Breakpoint.
   */
  instructionReference: string

  /**
   * An optional offset from the instruction reference.
   * This can be negative.
   */
  offset?: number

  /**
   * An optional expression for conditional breakpoints.
   * It is only honored by a debug adapter if the capability
   * 'supportsConditionalBreakpoints' is true.
   */
  condition?: string

  /**
   * An optional expression that controls how many hits of the breakpoint are
   * ignored.
   * The backend is expected to interpret the expression as needed.
   * The attribute is only honored by a debug adapter if the capability
   * 'supportsHitConditionalBreakpoints' is true.
   */
  hitCondition?: string
}

export interface Breakpoint {
  /**
   * An optional identifier for the breakpoint. It is needed if breakpoint
   * events are used to update or remove breakpoints.
   */
  id?: number

  /**
   * If true breakpoint could be set (but not necessarily at the desired
   * location).
   */
  verified: boolean

  /**
   * An optional message about the state of the breakpoint.
   * This is shown to the user and can be used to explain why a breakpoint could
   * not be verified.
   */
  message?: string

  /**
   * The source where the breakpoint is located.
   */
  source?: Source

  /**
   * The start line of the actual range covered by the breakpoint.
   */
  line?: number

  /**
   * An optional start column of the actual range covered by the breakpoint.
   */
  column?: number

  /**
   * An optional end line of the actual range covered by the breakpoint.
   */
  endLine?: number

  /**
   * An optional end column of the actual range covered by the breakpoint.
   * If no end line is given, then the end column is assumed to be in the start
   * line.
   */
  endColumn?: number

  /**
   * An optional memory reference to where the breakpoint is set.
   */
  instructionReference?: string

  /**
   * An optional offset from the instruction reference.
   * This can be negative.
   */
  offset?: number
}

type SteppingGranularity = 'statement' | 'line' | 'instruction'

export interface StepInTarget {
  /**
   * Unique identifier for a stepIn target.
   */
  id: number

  /**
   * The name of the stepIn target (shown in the UI).
   */
  label: string
}

export interface GotoTarget {
  /**
   * Unique identifier for a goto target. This is used in the goto request.
   */
  id: number

  /**
   * The name of the goto target (shown in the UI).
   */
  label: string

  /**
   * The line of the goto target.
   */
  line: number

  /**
   * An optional column of the goto target.
   */
  column?: number

  /**
   * An optional end line of the range covered by the goto target.
   */
  endLine?: number

  /**
   * An optional end column of the range covered by the goto target.
   */
  endColumn?: number

  /**
   * Optional memory reference for the instruction pointer value represented by
   * this target.
   */
  instructionPointerReference?: string
}

export interface CompletionItem {
  /**
   * The label of this completion item. By default this is also the text that is
   * inserted when selecting this completion.
   */
  label: string

  /**
   * If text is not falsy then it is inserted instead of the label.
   */
  text?: string

  /**
   * A string that should be used when comparing this item with other items.
   * When `falsy` the label is used.
   */
  sortText?: string

  /**
   * The item's type. Typically the client uses this information to render the
   * item in the UI with an icon.
   */
  type?: CompletionItemType

  /**
   * This value determines the location (in the CompletionsRequest's 'text'
   * attribute) where the completion text is added.
   * If missing the text is added at the location specified by the
   * CompletionsRequest's 'column' attribute.
   */
  start?: number

  /**
   * This value determines how many characters are overwritten by the completion
   * text.
   * If missing the value 0 is assumed which results in the completion text
   * being inserted.
   */
  length?: number

  /**
   * Determines the start of the new selection after the text has been inserted
   * (or replaced).
   * The start position must in the range 0 and length of the completion text.
   * If omitted the selection starts at the end of the completion text.
   */
  selectionStart?: number

  /**
   * Determines the length of the new selection after the text has been inserted
   * (or replaced).
   * The selection can not extend beyond the bounds of the completion text.
   * If omitted the length is assumed to be 0.
   */
  selectionLength?: number
}

type CompletionItemType =
  | 'method'
  | 'function'
  | 'constructor'
  | 'field'
  | 'variable'
  | 'class'
  | 'export interface'
  | 'module'
  | 'property'
  | 'unit'
  | 'value'
  | 'enum'
  | 'keyword'
  | 'snippet'
  | 'text'
  | 'color'
  | 'file'
  | 'reference'
  | 'customcolor'

type ChecksumAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'timestamp'

export interface Checksum {
  /**
   * The algorithm used to calculate this checksum.
   */
  algorithm: ChecksumAlgorithm

  /**
   * Value of the checksum.
   */
  checksum: string
}

export interface ValueFormat {
  /**
   * Display the value in hex.
   */
  hex?: boolean
}

export interface StackFrameFormat extends ValueFormat {
  /**
   * Displays parameters for the stack frame.
   */
  parameters?: boolean

  /**
   * Displays the types of parameters for the stack frame.
   */
  parameterTypes?: boolean

  /**
   * Displays the names of parameters for the stack frame.
   */
  parameterNames?: boolean

  /**
   * Displays the values of parameters for the stack frame.
   */
  parameterValues?: boolean

  /**
   * Displays the line number of the stack frame.
   */
  line?: boolean

  /**
   * Displays the module of the stack frame.
   */
  module?: boolean

  /**
   * Includes all stack frames, including those the debug adapter might
   * otherwise hide.
   */
  includeAll?: boolean
}

export interface ExceptionFilterOptions {
  /**
   * ID of an exception filter returned by the 'exceptionBreakpointFilters'
   * capability.
   */
  filterId: string

  /**
   * An optional expression for conditional exceptions.
   * The exception will break into the debugger if the result of the condition
   * is true.
   */
  condition?: string
}

export interface ExceptionOptions {
  /**
   * A path that selects a single or multiple exceptions in a tree. If 'path' is
   * missing, the whole tree is selected.
   * By convention the first segment of the path is a category that is used to
   * group exceptions in the UI.
   */
  path?: ExceptionPathSegment[]

  /**
   * Condition when a thrown exception should result in a break.
   */
  breakMode: ExceptionBreakMode
}

type ExceptionBreakMode = 'never' | 'always' | 'unhandled' | 'userUnhandled'

export interface ExceptionPathSegment {
  /**
   * If false or missing this segment matches the names provided, otherwise it
   * matches anything except the names provided.
   */
  negate?: boolean

  /**
   * Depending on the value of 'negate' the names that should match or not
   * match.
   */
  names: string[]
}

export interface ExceptionDetails {
  /**
   * Message contained in the exception.
   */
  message?: string

  /**
   * Short type name of the exception object.
   */
  typeName?: string

  /**
   * Fully-qualified type name of the exception object.
   */
  fullTypeName?: string

  /**
   * Optional expression that can be evaluated in the current scope to obtain
   * the exception object.
   */
  evaluateName?: string

  /**
   * Stack trace at the time the exception was thrown.
   */
  stackTrace?: string

  /**
   * Details of the exception contained by this exception, if any.
   */
  innerException?: ExceptionDetails[]
}

export interface DisassembledInstruction {
  /**
   * The address of the instruction. Treated as a hex value if prefixed with
   * '0x', or as a decimal value otherwise.
   */
  address: string

  /**
   * Optional raw bytes representing the instruction and its operands, in an
   * implementation-defined format.
   */
  instructionBytes?: string

  /**
   * Text representing the instruction and its operands, in an
   * implementation-defined format.
   */
  instruction: string

  /**
   * Name of the symbol that corresponds with the location of this instruction,
   * if any.
   */
  symbol?: string

  /**
   * Source location that corresponds to this instruction, if any.
   * Should always be set (if available) on the first instruction returned,
   * but can be omitted afterwards if this instruction maps to the same source
   * file as the previous instruction.
   */
  location?: Source

  /**
   * The line within the source location that corresponds to this instruction,
   * if any.
   */
  line?: number

  /**
   * The column within the line that corresponds to this instruction, if any.
   */
  column?: number

  /**
   * The end line of the range that corresponds to this instruction, if any.
   */
  endLine?: number

  /**
   * The end column of the range that corresponds to this instruction, if any.
   */
  endColumn?: number
}

export type InvalidatedAreas = 'all' | 'stacks' | 'threads' | 'variables' | String
