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
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Add this in your _app.js or appropriate file

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
    
    return (
        <div className="w-screen h-screen relative bg-gray-100 overflow-hidden">{/* Changed from white-200 to gray-100 */}
            <div className="absolute top-2 right-4 flex items-center space-x-2 z-10">
                {/* Mode toggle switch */}
                <div 
                    onClick={toggleMode}
                    className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700 transition-colors duration-300 ease-in-out text-sm font-medium shadow-md"
                >
                    {isPreviewMode ? 'Edit' : 'Preview'}
                </div>
                
                {/* Update button */}
                {updatable &&
                <div
                    onClick={onSubmit}
                    className='px-3 py-1.5 bg-emerald-600 text-white rounded-md cursor-pointer hover:bg-emerald-700 transition-colors duration-300 ease-in-out text-sm font-medium shadow-md flex items-center'
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
                <div className="w-screen h-screen overflow-y-auto p-2">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            // Headings
                            h1: ({ node, ...props }) => (
                            <h1 
                                className="text-3xl font-bold mb-8 pb-3 border-b border-gray-200 text-gray-800 tracking-tight leading-tight" 
                                {...props} 
                            />
                            ),
                            h2: ({ node, ...props }) => (
                            <h2 
                                className="text-2xl font-bold mt-12 mb-6 text-gray-800 tracking-tight leading-tight" 
                                {...props} 
                            />
                            ),
                            h3: ({ node, ...props }) => (
                            <h3 
                                className="text-xl font-semibold mt-10 mb-4 text-gray-800 leading-snug" 
                                {...props} 
                            />
                            ),
                            h4: ({ node, ...props }) => (
                            <h4 
                                className="text-lg font-semibold mt-8 mb-3 text-gray-800 leading-snug" 
                                {...props} 
                            />
                            ),
                            h5: ({ node, ...props }) => (
                            <h5 
                                className="text-base font-semibold mt-6 mb-2 text-gray-800" 
                                {...props} 
                            />
                            ),
                            h6: ({ node, ...props }) => (
                            <h6 
                                className="text-sm font-semibold mt-4 mb-2 text-gray-800 uppercase tracking-wider" 
                                {...props} 
                            />
                            ),
                            
                            // Paragraph
                            p: ({ node, ...props }) => (
                            <p 
                                className="mb-6 text-base leading-7 text-gray-700" 
                                {...props} 
                            />
                            ),
                            
                            // Links
                            a: ({ node, ...props }) => (
                            <a 
                                className="text-gray-800 font-medium border-b border-gray-300 hover:border-gray-800 hover:text-gray-900 transition-all duration-200 ease-in-out" 
                                {...props} 
                            />
                            ),
                            
                            // Lists
                            ul: ({ node, ...props }) => (
                            <ul 
                                className="mb-6 ml-6 list-disc text-gray-700 space-y-2" 
                                {...props} 
                            />
                            ),
                            ol: ({ node, ...props }) => (
                            <ol 
                                className="mb-6 ml-6 list-decimal text-gray-700 space-y-2" 
                                {...props} 
                            />
                            ),
                            li: ({ node, ...props }) => (
                            <li 
                                className="mb-2 pl-1" 
                                {...props} 
                            />
                            ),
                            
                            // Blockquotes
                            blockquote: ({ node, ...props }) => (
                            <blockquote 
                                className="border-l-2 border-gray-400 pl-6 my-8 text-gray-600 bg-gray-50 py-4 pr-6 rounded-sm font-light italic" 
                                {...props} 
                            />
                            ),
                            
                            // Code blocks and inline code
                            code: ({ node, inline, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return inline ? (
                                <code 
                                    className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                                    style={{ display: 'inline' }} 
                                    {...props}
                                    >
                                    {children}
                                </code>
                            ) : (
                                <SyntaxHighlighter
                                    style={vs2015}
                                    language={'javascript'}
                                    PreTag="div"
                                    className="rounded-md my-6 shadow-sm"
                                    {...props}
                                >
                                {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            );
                            },
                            
                            pre: ({ node, ...props }) => (
                            <pre 
                                className="my-8 rounded-md overflow-hidden shadow-sm" 
                                {...props} 
                            />
                            ),
                            
                            // Horizontal rule
                            hr: ({ node, ...props }) => (
                            <hr 
                                className="my-10 border-t border-gray-200" 
                                {...props} 
                            />
                            ),
                            
                            // Tables
                            table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-8">
                                <table 
                                className="min-w-full border border-gray-200 rounded-md shadow-sm" 
                                {...props} 
                                />
                            </div>
                            ),
                            thead: ({ node, ...props }) => (
                            <thead 
                                className="bg-gray-50" 
                                {...props} 
                            />
                            ),
                            tbody: ({ node, ...props }) => (
                            <tbody 
                                className="divide-y divide-gray-200" 
                                {...props} 
                            />
                            ),
                            tr: ({ node, ...props }) => (
                            <tr 
                                className="hover:bg-gray-50 transition-colors duration-150" 
                                {...props} 
                            />
                            ),
                            th: ({ node, ...props }) => (
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200" 
                                {...props} 
                            />
                            ),
                            td: ({ node, ...props }) => (
                            <td 
                                className="px-6 py-4 whitespace-normal text-gray-700 text-sm" 
                                {...props} 
                            />
                            ),
                            
                            // Images
                            img: ({ node, ...props }) => (
                            <img 
                                className="max-w-full h-auto rounded-md my-8 mx-auto shadow-sm" 
                                {...props} 
                                alt={props.alt || 'Image'} 
                            />
                            ),
                            
                            // Text formatting
                            strong: ({ node, ...props }) => (
                            <strong 
                                className="font-semibold text-gray-900" 
                                {...props} 
                            />
                            ),
                            em: ({ node, ...props }) => (
                            <em 
                                className="italic text-gray-700" 
                                {...props} 
                            />
                            ),
                            del: ({ node, ...props }) => (
                            <del 
                                className="text-gray-500 line-through" 
                                {...props} 
                            />
                            ),
                            
                            // Special elements
                            sup: ({ node, ...props }) => (
                            <sup 
                                className="text-xs text-gray-600 relative -top-1" 
                                style={{ display: 'inline-block' }}
                                {...props} 
                            />
                            ),
                            sub: ({ node, ...props }) => (
                            <sub 
                                className="text-xs text-gray-600 relative -bottom-1" 
                                style={{ display: 'inline-block' }}
                                {...props} 
                            />
                            ),
                            
                            // Keyboard shortcuts
                            kbd: ({ node, ...props }) => (
                            <kbd 
                                className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md shadow-sm mx-0.5" 
                                style={{ display: 'inline-flex' }}
                                {...props} 
                            />
                            ),
                        }}
                        >
                        {text}
                    </ReactMarkdown>
                </div>
            ) : (
                <textarea
                    className='w-screen h-screen text-black bg-gray-50 p-8 font-mono text-md leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent'
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