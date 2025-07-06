"use client";
import { useSearchParams } from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { Clock, User, GitBranch, Database, Rocket, ExternalLink, Play, Loader2, Calendar, Timer } from 'lucide-react';

interface PipelineGroupExecutionReport {
  pipeline_group_id: string;
  pipeline_name: string;
  pipeline_code: string;
  pipeline_parameters: Record<string, string | number | boolean>;
  pipeline_inputs: Record<string, string>;
  count: number;
}

interface UserExecutionReport {
  user_id: string;
  user_name: string;
  user_email: string;
  user_image: string;
}

interface ExecutionReport {
  factory_id: string;
  project_id: string;
  solution_url: string;
  rocket_cost: number;
  start_time: number;
  end_time: number;
  user: UserExecutionReport;
  pipelines_standalone_repo: string;
  pipelines_standalone_commit: string;
  pipelines: PipelineGroupExecutionReport[];
}

const ExecutionReportViewerC = () => {
  // Retrieving URL
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  
  // Retrieving BLOB
  const { data } = useGetFile({ fetchUrl: url as string });
  
  // Parse the JSON
  const [executionReport, setExecutionReport] = useState<ExecutionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!data) return;
    
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        setExecutionReport(JSON.parse(e.target?.result as string) as ExecutionReport);
      } catch (error) {
        console.error('Failed to parse execution report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(data);
  }, [data]);

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (startTime: number, endTime: number): string => {
    const durationMs = (endTime - startTime) * 1000;
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const renderParameterValue = (value: string | number | boolean): string => {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return String(value);
  };

  if (isLoading || !executionReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600 font-medium">Loading execution report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                  Execution Report
                </h1>
                <p className="text-slate-600 text-lg">Comprehensive pipeline execution overview</p>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-2xl shadow-lg">
                <Rocket className="w-6 h-6" />
                <span className="text-2xl font-bold">{executionReport.rocket_cost}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-700">Factory</h3>
                </div>
                <p className="text-xl font-bold text-slate-900">{executionReport.factory_id}</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-700">Project</h3>
                </div>
                <p className="text-xl font-bold text-slate-900">{executionReport.project_id}</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-700">Solution</h3>
                </div>
                <a 
                  href={executionReport.solution_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center gap-2 font-medium"
                >
                  View Deployment
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline & User Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Timeline */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Execution Timeline</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Started</p>
                  <p className="text-lg font-semibold text-slate-900">{formatTimestamp(executionReport.start_time)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Completed</p>
                  <p className="text-lg font-semibold text-slate-900">{formatTimestamp(executionReport.end_time)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Duration</p>
                  <p className="text-xl font-bold text-slate-900">{formatDuration(executionReport.start_time, executionReport.end_time)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Executed By</h2>
            </div>
            
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={executionReport.user.user_image} 
                    alt={executionReport.user.user_name}
                    className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{executionReport.user.user_name}</h3>
                  <p className="text-slate-600 mb-1">{executionReport.user.user_email}</p>
                  <p className="text-sm text-slate-500 font-mono">ID: {executionReport.user.user_id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Repository */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Source Repository</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-semibold text-slate-700 mb-3">Repository URL</h3>
              <a 
                href={executionReport.pipelines_standalone_repo} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center gap-2 break-all"
              >
                {executionReport.pipelines_standalone_repo}
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
              </a>
            </div>
            
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-semibold text-slate-700 mb-3">Commit Hash</h3>
              <p className="font-mono text-slate-900 break-all bg-white px-3 py-2 rounded-lg border">
                {executionReport.pipelines_standalone_commit}
              </p>
            </div>
          </div>
        </div>

        {/* Pipelines */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Pipeline Executions</h2>
            </div>
            <div className="bg-gradient-to-r from-indigo-100 to-blue-100 px-4 py-2 rounded-xl">
              <span className="text-indigo-700 font-semibold">{executionReport.pipelines.length} pipelines</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {executionReport.pipelines.map((pipeline, index) => (
              <div key={pipeline.pipeline_group_id} className="bg-gradient-to-r from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{pipeline.pipeline_name}</h3>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-xl">
                      <Play className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 font-semibold">{pipeline.count} executions</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="font-semibold text-slate-700">Group ID:</span>
                      <span className="ml-2 text-slate-900">{pipeline.pipeline_group_id}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="font-semibold text-slate-700">Code File:</span>
                      <span className="ml-2 font-mono text-slate-900">{pipeline.pipeline_code}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    
                    {/* Parameters */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                        Parameters
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(pipeline.pipeline_parameters).map(([key, value]) => (
                          <div key={key} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-blue-700">{key}</span>
                              <span className="text-slate-900 font-mono bg-white px-2 py-1 rounded-lg text-sm">
                                {renderParameterValue(value)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Inputs */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">I</span>
                        </div>
                        Inputs
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(pipeline.pipeline_inputs).map(([key, value]) => (
                          <div key={key} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                            <div className="mb-2">
                              <span className="font-semibold text-purple-700">{key}</span>
                            </div>
                            <p className="text-slate-900 break-all bg-white p-2 rounded-lg text-sm font-mono">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Grid = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600 font-medium">Loading execution report...</p>
        </div>
      </div>
    }>
      <ExecutionReportViewerC />
    </Suspense>
  );
};

export default Grid;