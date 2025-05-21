"use client";
import { useSearchParams } from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import ReactMarkdown from 'react-markdown'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
//import 'remark-github-blockquote-alert/alert.css'
import './alerts.css'
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Add this in your _app.js or appropriate file
import { remarkAlert } from 'remark-github-blockquote-alert'
import useGetFileHead from '../(hooks)/useGetFileHead';
import { markdownSnippets } from './markdownSnippets';
import useUploadFile from '../(hooks)/useUploadFile';



// Helper component for the markdown snippets panel
type MarkdownSnippetProps = {
    title: string;
    snippet: string;
    description: string;
    onCopy: (snippet: string) => void;
};

const MarkdownSnippet = ({ title, snippet, description, onCopy }: MarkdownSnippetProps) => {
    return (
        <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-700">{title}</h3>
                <button 
                    onClick={() => onCopy(snippet)} 
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Copy
                </button>
            </div>
            
            <div className="bg-gray-50 p-2 rounded font-mono text-sm text-gray-700 mb-3 whitespace-pre-wrap border border-gray-200">
                {snippet}
            </div>
            
            <div className="border p-3 rounded bg-white">
                <ReactMarkdown
                    remarkPlugins={[remarkMath, remarkGfm, remarkAlert]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 text-gray-900" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 text-gray-800" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-1 text-gray-800" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 text-sm text-gray-700" {...props} />,
                        ul: ({node, ...props}) => <ul className="mb-2 ml-4 list-disc text-gray-700 text-sm" {...props} />,
                        ol: ({node, ...props}) => <ol className="mb-2 ml-4 list-decimal text-gray-700 text-sm" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        code: ({className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInlineCode = !match && !String(children).includes('\n');
                            
                            if (isInlineCode) {
                                return <code className="bg-gray-100 px-1 text-gray-800 font-mono rounded text-sm" {...props}>{children}</code>;
                            }
                            
                            return <div className="my-2">
                                <SyntaxHighlighter
                                    style={atomDark as any}
                                    language={match ? match[1] : 'text'}
                                    className="rounded-md text-xs"
                                    showLineNumbers={false}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        },
                        a: ({node, ...props}) => <a className="text-indigo-600 text-sm" {...props} />,
                        img: ({node, ...props}) => <img className="max-w-full h-auto rounded text-sm" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto my-2 rounded border border-gray-200"><table className="min-w-full border-collapse text-sm" {...props} /></div>,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-3 my-2 text-gray-600 text-sm" {...props} />,
                    }}>
                    {snippet}
                </ReactMarkdown>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">{description}</p>
        </div>
    );
};

const Txt = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    // NO-CHANGE Retrieving BLOB
    const { data } = useGetFile({fetchUrl: url as string})
    const { data: head } = useGetFileHead({fetchUrl: url as string})
    const editable = head ? head.editable : true;
    console.log('editable', editable)
    // Local states, you may modify this for other types
    const [text, setText] = useState<string>('');
    const [updatable, setUpdatable] = useState<boolean>(false);
    const [updatableAgain, setUpdatableAgain] = useState<boolean>(false);
    const [isPreviewMode, setIsPreviewMode] = useState<boolean>(true); // Default to preview mode
    
    // Helper panel state
    const [isHelperPanelOpen, setIsHelperPanelOpen] = useState<boolean>(false);
    
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
    
    // Toggle helper panel
    const toggleHelperPanel = () => {
        setIsHelperPanelOpen(!isHelperPanelOpen);
    }
    
    // Copy snippet to editor
    const copySnippet = async (snippet: string) => {
        try {
            await navigator.clipboard.writeText(snippet);
        } catch (err) {
            // fallback: select and copy via execCommand (legacy)
            const textarea = document.createElement('textarea');
            textarea.value = snippet;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                onSubmit();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [text, onSubmit]);
    
    // Helper function to check if a URL is a YouTube link and extract video ID
    const getYouTubeVideoId = (url: string) => {
        const regexps = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/i
        ];
        
        for (const regex of regexps) {
            const match = url.match(regex);
            if (match) return match[1];
        }
        
        return null;
    };
    
    // Uploader (for images)
    const {mutate: upload} = useUploadFile(
        {fetchUrl: url as string})

    return (
        <div className="w-screen h-screen overflow-hidden">
            <div className="absolute top-3 right-4 flex items-center space-x-3 z-10">
                {/* Mode toggle switch */}
                {editable && <div 
                    onClick={toggleMode}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors duration-300 ease-in-out text-sm font-medium shadow-sm"
                >
                    {isPreviewMode ? 'Edit' : 'Preview'}
                </div>}
                
                {/* Update button */}
                {editable && updatable &&
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
            {(isPreviewMode || !editable) ? (
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
                                        style={atomDark as any}
                                        language={match ? match[1] : 'text'}
                                        className="rounded-md shadow-2xl"
                                        showLineNumbers={true}
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
                            
                            // Professional, adaptive image display
                            img: ({node, ...props}) => (
                                <div className="flex justify-center">
                                    <img
                                        className="rounded-lg shadow-md"
                                        style={{
                                            maxWidth: '100%',
                                            height: 'auto',
                                            maxHeight: '60vh',
                                            objectFit: 'contain',
                                            display: 'block'
                                        }}
                                        {...props}
                                    />
                                </div>
                            ),
                            
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
                <div className="w-screen h-screen flex">
                    <textarea
                        className={`h-full p-4 font-mono text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 ${isHelperPanelOpen ? 'w-2/3' : 'w-full'}`}
                        value={text}
                        style={{ resize: 'none' }}
                        onChange={(e) => { setText(e.target.value); setUpdatable(true); setUpdatableAgain(true); }}
                        onPaste={async (e) => {
                            // Check for image in clipboard
                            const items = e.clipboardData?.items;
                            if (items) {
                                for (let i = 0; i < items.length; i++) {
                                    const item = items[i];
                                    if (item.type.startsWith('image/')) {
                                        e.preventDefault();
                                        const file = item.getAsFile();
                                        if (file) {
                                            // Upload the image
                                            upload(file, {
                                                onSuccess: (result: any) => {
                                                    console.log('Image upload result:', result);
                                                    // Assume result.url is the uploaded image URL
                                                    if (result?.url) {
                                                        // Insert markdown image at cursor position
                                                        const textarea = e.target as HTMLTextAreaElement;
                                                        const before = text.slice(0, textarea.selectionStart);
                                                        const after = text.slice(textarea.selectionEnd);
                                                        const markdown = `![image](${result.url})`;
                                                        const newText = before + markdown + after;
                                                        setText(newText);
                                                        setUpdatable(true);
                                                        setUpdatableAgain(true);
                                                    }
                                                }
                                            });
                                        }
                                        break;
                                    }
                                }
                            }
                        }}
                    />
                                        
                    {/* Helper panel toggle button */}
                    {!isHelperPanelOpen && <div 
                        className={`absolute ${isHelperPanelOpen ? 'right-80' : 'right-4'} top-16 z-20 bg-white p-2 rounded-l-lg shadow-md cursor-pointer hover:bg-gray-100 transition-all duration-300`}
                        onClick={toggleHelperPanel}
                        title={isHelperPanelOpen ? "Hide Markdown Help" : "Show Markdown Help"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>}
                    
                    {/* Helper panel */}
                    {isHelperPanelOpen && (
                        <div className="h-full bg-white border-l border-gray-200 w-1/3 overflow-y-auto">
                            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                                <h2 className="text-lg font-semibold text-gray-700">Markdown Cheatsheet</h2>
                                <p className="text-sm text-gray-500">Click on the Copy button to add a snippet to your document</p>
                            </div>
                            <div 
                                className="cursor-pointer text-gray-600 hover:text-gray-800 p-4 text-sm font-medium flex items-center justify-center border-b border-gray-200"
                                onClick={toggleHelperPanel}
                                title="Close Helper Panel"
                            >
                                Close Panel
                            </div>
                            
                            {/* Markdown snippets */}
                            <div className="divide-y divide-gray-100">
                                {markdownSnippets.map((snippet, index) => (
                                    <MarkdownSnippet 
                                        key={index}
                                        title={snippet.title}
                                        snippet={snippet.snippet}
                                        description={snippet.description}
                                        onCopy={copySnippet}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
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