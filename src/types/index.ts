import { DebugSession } from 'vscode'

import type * as P from './DebugAdapterProtocol'

type RequestT =
  | P.CancelRequest
  | P.RunInTerminalRequest
  | P.InitializeRequest
  | P.ConfigurationDoneRequest
  | P.LaunchRequest
  | P.AttachRequest
  | P.RestartRequest
  | P.DisconnectRequest
  | P.TerminateRequest
  | P.BreakpointLocationsRequest
  | P.SetBreakpointsRequest
  | P.SetFunctionBreakpointsRequest
  | P.SetExceptionBreakpointsRequest
  | P.DataBreakpointInfoRequest
  | P.SetDataBreakpointsRequest
  | P.SetInstructionBreakpointsRequest
  | P.ContinueRequest
  | P.NextRequest
  | P.StepInRequest
  | P.StepOutRequest
  | P.StepBackRequest
  | P.ReverseContinueRequest
  | P.RestartFrameRequest
  | P.GotoRequest
  | P.PauseRequest
  | P.StackTraceRequest
  | P.ScopesRequest
  | P.VariablesRequest
  | P.SetVariableRequest
  | P.SourceRequest
  | P.ThreadsRequest
  | P.TerminateThreadsRequest
  | P.ModulesRequest
  | P.LoadedSourcesRequest
  | P.EvaluateRequest
  | P.SetExpressionRequest
  | P.StepInTargetsRequest
  | P.GotoTargetsRequest
  | P.CompletionsRequest
  | P.ExceptionInfoRequest
  | P.ReadMemoryRequest
  | P.DisassembleRequest

export type EventT =
  | P.InitializedEvent
  | P.StoppedEvent
  | P.ContinuedEvent
  | P.ExitedEvent
  | P.TerminatedEvent
  | P.ThreadEvent
  | P.OutputEvent
  | P.BreakpointEvent
  | P.ModuleEvent
  | P.LoadedSourceEvent
  | P.ProcessEvent
  | P.CapabilitiesEvent
  | P.ProgressStartEvent
  | P.ProgressUpdateEvent
  | P.ProgressEndEvent
  | P.InvalidatedEvent

export interface CommandToResponseMapT
  extends Implements<
    Exact<Record<RequestT['command'], unknown>, CommandToResponseMapT>,
    CommandToResponseMapT
  > {
  cancel: P.CancelArguments
  runInTerminal: P.RunInTerminalResponse
  initialize: P.InitializeResponse
  configurationDone: P.ConfigurationDoneResponse
  launch: P.LaunchResponse
  attach: P.AttachResponse
  restart: P.RestartResponse
  disconnect: P.DisconnectResponse
  terminate: P.TerminateResponse
  breakpointLocations: P.BreakpointLocationsArguments
  setBreakpoints: P.SetBreakpointsResponse
  setFunctionBreakpoints: P.SetFunctionBreakpointsResponse
  setExceptionBreakpoints: P.SetExceptionBreakpointsResponse
  dataBreakpointInfo: P.DataBreakpointInfoResponse
  setDataBreakpoints: P.SetDataBreakpointsResponse
  setInstructionBreakpoints: P.SetInstructionBreakpointsResponse
  continue: P.ContinueResponse
  next: P.NextResponse
  stepIn: P.StepInResponse
  stepOut: P.StepOutResponse
  stepBack: P.StepBackResponse
  reverseContinue: P.ReverseContinueResponse
  restartFrame: P.RestartFrameResponse
  goto: P.GotoResponse
  pause: P.PauseResponse
  stackTrace: P.StackTraceResponse
  scopes: P.ScopesResponse
  variables: P.VariablesResponse
  setVariable: P.SetVariableResponse
  source: P.SourceResponse
  threads: P.ThreadsResponse
  terminateThreads: P.TerminateThreadsResponse
  modules: P.ModulesResponse
  loadedSources: P.LoadedSourcesResponse
  evaluate: P.EvaluateResponse
  setExpression: P.SetExpressionResponse
  stepInTargets: P.StepInTargetsResponse
  gotoTargets: P.GotoTargetsResponse
  completions: P.CompletionsResponse
  exceptionInfo: P.ExceptionInfoResponse
  readMemory: P.ReadMemoryResponse
  disassemble: P.DisassembleResponse
}

export interface CommandToArgumentsMapT
  extends Implements<
    Exact<Record<RequestT['command'], unknown>, CommandToArgumentsMapT>,
    CommandToArgumentsMapT
  > {
  cancel: P.CancelArguments
  runInTerminal: P.RunInTerminalRequestArguments
  initialize: P.InitializeRequestArguments
  configurationDone: P.ConfigurationDoneArguments
  launch: P.LaunchRequestArguments
  attach: P.AttachRequestArguments
  restart: P.RestartArguments
  disconnect: P.DisconnectArguments
  terminate: P.TerminateArguments
  breakpointLocations: P.BreakpointLocationsArguments
  setBreakpoints: P.SetBreakpointsArguments
  setFunctionBreakpoints: P.SetFunctionBreakpointsArguments
  setExceptionBreakpoints: P.SetExceptionBreakpointsArguments
  dataBreakpointInfo: P.DataBreakpointInfoArguments
  setDataBreakpoints: P.SetDataBreakpointsArguments
  setInstructionBreakpoints: P.SetInstructionBreakpointsArguments
  continue: P.ContinueArguments
  next: P.NextArguments
  stepIn: P.StepInArguments
  stepOut: P.StepOutArguments
  stepBack: P.StepBackArguments
  reverseContinue: P.ReverseContinueArguments
  restartFrame: P.RestartFrameArguments
  goto: P.GotoArguments
  pause: P.PauseArguments
  stackTrace: P.StackTraceArguments
  scopes: P.ScopesArguments
  variables: P.VariablesArguments
  setVariable: P.SetVariableArguments
  source: P.SourceArguments
  threads: never
  terminateThreads: P.TerminateThreadsArguments
  modules: P.ModulesArguments
  loadedSources: P.LoadedSourcesArguments
  evaluate: P.EvaluateArguments
  setExpression: P.SetExpressionArguments
  stepInTargets: P.StepInTargetsArguments
  gotoTargets: P.GotoTargetsArguments
  completions: P.CompletionsArguments
  exceptionInfo: P.ExceptionInfoArguments
  readMemory: P.ReadMemoryArguments
  disassemble: P.DisassembleArguments
}

export interface DebugSessionT extends DebugSession {
  customRequest<T extends RequestT['command']>(
    command: T,
    args: CommandToArgumentsMapT[T]
  ): CommandToResponseMapT[T] extends { body: unknown }
    ? Thenable<CommandToResponseMapT[T]['body']>
    : Thenable<any>
}
