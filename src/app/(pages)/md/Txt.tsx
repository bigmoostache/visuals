"use client";
import { useSearchParams } from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import ReactMarkdown from 'react-markdown'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'remark-github-blockquote-alert/alert.css'
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Add this in your _app.js or appropriate file
import { remarkAlert } from 'remark-github-blockquote-alert'

const Txt = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    // NO-CHANGE Retrieving BLOB
    const { data } = useGetFile({fetchUrl: url as string})
    // Local states, you may modify this for other types
    const [text, setText] = useState<string>('');
    const [updatable, setUpdatable] = useState<boolean>(false);
    const [updatableAgain, setUpdatableAgain] = useState<boolean>(false);
    const [isPreviewMode, setIsPreviewMode] = useState<boolean>(true); // Default to preview mode
    
    // Local conversion blob -> local type
    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function(e) {
          setText(e.target?.result as string);
        }
        reader.readAsText(data);
      }, [data]);
    
    // Local conversion local type -> blob
    const convertBackToFile = (text: string) => {
        const blob = new Blob([text], {type: 'text/plain'});
        return new File([blob], 'filename.txt', { lastModified: Date.now(), type: blob.type });
    }
    
    // NO-CHANGE Updating BLOB imports
    const { mutate, isLoading, isSuccess } = usePatchFile(
        {fetchUrl: url as string}
    );
    
    // Updating BLOB local logic (especially, onSuccess)
    const onSubmit = async () => {
        console.log('submit');
        setUpdatableAgain(false);
        mutate(convertBackToFile(text));
    }

    // Toggle between edit and preview modes
    const toggleMode = () => {
        setIsPreviewMode(!isPreviewMode);
    }
    
    // Helper function to check if a URL is a YouTube link and extract video ID
    const getYouTubeVideoId = (url) => {
        // Match patterns like:
        // https://www.youtube.com/watch?v=VIDEO_ID
        // https://youtu.be/VIDEO_ID
        // https://youtube.com/embed/VIDEO_ID
        
        const regexps = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/i
        ];
        
        for (const regex of regexps) {
            const match = url.match(regex);
            if (match) return match[1];
        }
        
        return null;
    };
    
    return (
        <div className="w-screen h-screen overflow-hidden bg-gray-50">
            <div className="absolute top-3 right-4 flex items-center space-x-3 z-10">
                {/* Mode toggle switch */}
                <div 
                    onClick={toggleMode}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors duration-300 ease-in-out text-sm font-medium shadow-sm"
                >
                    {isPreviewMode ? 'Edit' : 'Preview'}
                </div>
                
                {/* Update button */}
                {updatable &&
                <div
                    onClick={onSubmit}
                    className='px-4 py-2 bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors duration-300 ease-in-out text-sm font-medium shadow-sm flex items-center'
                >
                {
                    updatableAgain && 'Update'
                }
                {
                    !updatableAgain && isLoading && 'Updating...'
                }
                {
                    !updatableAgain && !isLoading && isSuccess &&
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                }
                </div>
                }
            </div>
            
            {/* Conditional rendering based on mode */}
            {isPreviewMode ? (
                <div className="w-screen h-screen overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm, remarkAlert]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            // Professional heading hierarchy with refined typography
                            h1: ({node, ...props}) => <h1 className="text-4xl font-bold mb-8 pb-4 border-b border-gray-200 text-gray-900 tracking-tight leading-tight" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-3xl font-bold mt-14 mb-6 text-gray-800 tracking-tight leading-tight" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-2xl font-semibold mt-12 mb-5 text-gray-800 leading-snug" {...props} />,
                            h4: ({node, ...props}) => <h4 className="text-xl font-semibold mt-10 mb-4 text-gray-800 leading-snug" {...props} />,
                            h5: ({node, ...props}) => <h5 className="text-lg font-semibold mt-8 mb-3 text-gray-800" {...props} />,
                            h6: ({node, ...props}) => <h6 className="text-base font-semibold mt-6 mb-3 text-gray-700 uppercase tracking-wider" {...props} />,
                            
                            // Optimized paragraph spacing and readability
                            p: ({node, ...props}) => <p className="mb-6 text-base leading-7 text-gray-700 font-normal" {...props} />,
                            
                            // Modified link handling - YouTube links become embeds, others remain as links
                            a: ({node, href, children, ...props}) => {
                                // Check if it's a YouTube link
                                const videoId = href ? getYouTubeVideoId(href) : null;
                                
                                if (videoId) {
                                    // It's a YouTube video, render an embed
                                    return (
                                        <div className="my-8">
                                            <iframe 
                                                width="100%" 
                                                height="480"
                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="rounded-lg shadow-lg"
                                            ></iframe>
                                        </div>
                                    );
                                } else {
                                    // Regular link
                                    return <a 
                                        href={href} 
                                        className="text-indigo-600 font-medium border-b border-indigo-200 hover:border-indigo-600 hover:text-indigo-700 transition-all duration-200 ease-in-out" 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        {...props}
                                    >
                                        {children}
                                    </a>;
                                }
                            },
                            
                            // Well-structured lists
                            ul: ({node, ...props}) => <ul className="mb-8 ml-6 list-disc text-gray-700 space-y-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="mb-8 ml-6 list-decimal text-gray-700 space-y-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-2 pl-2" {...props} />,
                            
                            // Professional blockquotes
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-700 pl-6 my-10 text-gray-600 bg-gray-50 py-5 pr-8 italic rounded-r-lg shadow-sm" {...props} />,
                            
                            // Elegant code formatting
                            code: ({className, children, ...props}) => {
                                // Determine if it's inline code by checking for language class and content structure
                                const match = /language-(\w+)/.exec(className || '');
                                const isInlineCode = !match && !String(children).includes('\n');
                                
                                // For inline code, return simple styled code tag
                                if (isInlineCode) {
                                    return <code className="bg-gray-100 px-2 py-1 text-gray-800 font-mono rounded text-sm border border-gray-200" {...props}>{children}</code>;
                                }
                                
                                // For code blocks, use SyntaxHighlighter with enhanced styling
                                return <div className="my-8">
                                    <SyntaxHighlighter
                                        style={atomDark}
                                        language={match ? match[1] : 'text'}
                                        className="rounded-md shadow-2xl"
                                        showLineNumbers={true}
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                </div>
                            },
                                                        
                            // Refined separator
                            hr: ({node, ...props}) => <hr className="my-12 border-t border-gray-200 max-w-3xl mx-auto" {...props} />,
                            
                            // Enterprise-grade table styling
                            table: ({node, ...props}) => <div className="overflow-x-auto my-10 rounded-lg shadow-md border border-gray-200"><table className="min-w-full border-collapse" {...props} /></div>,
                            thead: ({node, ...props}) => <thead className="bg-gray-100" {...props} />,
                            th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200" {...props} />,
                            td: ({node, ...props}) => <td className="px-6 py-4 border-b border-gray-100 text-gray-700 align-top text-sm" {...props} />,
                            
                            // Professional image display
                            img: ({node, ...props}) => <img className="max-w-full h-auto rounded-lg my-10 mx-auto shadow-md" {...props} />,
                            
                            // Typography refinements
                            strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                            em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                            del: ({node, ...props}) => <del className="text-gray-400 line-through" {...props} />,
                            
                            // Additional professional elements
                            sup: ({node, ...props}) => <sup className="text-xs text-gray-600" {...props} />,
                            sub: ({node, ...props}) => <sub className="text-xs text-gray-600" {...props} />,
                            kbd: ({node, ...props}) => <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md shadow-sm mx-1" {...props} />
                        }}>
                        {text}
                    </ReactMarkdown>
                </div>
            ) : (
                <textarea
                    className='w-screen h-screen p-4 font-mono text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500'
                    value={text}
                    style={{ resize: 'none' }}
                    onChange={(e) => {setText(e.target.value);setUpdatable(true);setUpdatableAgain(true)}}
                />
            )}
        </div>
    );
}

const TxtPage = () => {
    return (
      // You could have a loading skeleton as the `fallback` too
      <Suspense>
        <Txt />
      </Suspense>
    )
}

export default TxtPage;