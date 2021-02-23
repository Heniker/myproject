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
  cancel: P.CancelResponse
  runInTerminal: P.RunInTerminalResponse
  initialize: P.InitializeResponse
  configurationDone: P.ConfigurationDoneResponse
  launch: P.LaunchResponse
  attach: P.AttachResponse
  restart: P.RestartResponse
  disconnect: P.DisconnectResponse
  terminate: P.TerminateResponse
  breakpointLocations: P.BreakpointLocationsResponse
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

type TempT<T, U> = T extends { command: any; arguments: any }
  ? T['command'] extends U
    ? T['arguments']
    : never
  : never

export type CommandToArgumentsMapT = {
  [K in keyof CommandToResponseMapT]: TempT<RequestT, K>
}

export interface DebugSessionT extends DebugSession {
  customRequest<T extends RequestT['command']>(
    command: T,
    args: CommandToArgumentsMapT[T]
  ): Thenable<CommandToResponseMapT[T]['body']>
}
