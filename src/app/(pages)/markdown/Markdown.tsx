"use client";
import {useSearchParams} from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import {useEffect, useState} from 'react'
import {Suspense} from 'react'
import showdown from 'showdown';

const converter = new showdown.Converter()


const Markdown = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    // NO-CHANGE Retrieving BLOB
    const {data} = useGetFile({fetchUrl: url as string})
    // Local states, you may modify this for other types
    const [text, setText] = useState<string>('');
    const [html, setHtml] = useState<string>('');
    const [updatable, setUpdatable] = useState<boolean>(false);
    const [updatableAgain, setUpdatableAgain] = useState<boolean>(false);
    // Local conversion blob -> local type
    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            setText(e.target?.result as string);

        }
        reader.readAsText(data);
    }, [data]);

    useEffect(() => {
        const ref = manageReference(text)

        let redac = converter.makeHtml(ref.redac)
        const index = getIndex(redac)
        //inserer l index apres le premier h1 (titre de l etude)

        const endH1 = redac.indexOf("</h1>")
        if (endH1 > 0) {
            redac = redac.substring(0, endH1 + 5).concat(index, redac.substring(endH1 + 5))
        } else {
            redac = index.concat(redac)
        }


        let referenceHtml = converter.makeHtml(ref.references);
        const refRx = new RegExp(/^<p>\[(\d+)]/gmi)
        referenceHtml = referenceHtml.replace(refRx, (match, p1) => {
            return `<p id="index-${p1}">[${p1}]`;
        });
        let references = `<div class="bibliography">${referenceHtml}</div>`

        setHtml(redac.concat(references))
    }, [text]);

    // Local conversion local type -> blob
    const convertBackToFile = (text: string) => {
        const blob = new Blob([text], {type: 'text/plain'});
        return new File([blob], 'filename.txt', {lastModified: Date.now(), type: blob.type});
    }
    // NO-CHANGE Updating BLOB imports
    const {mutate, isLoading, isSuccess} = usePatchFile(
        {fetchUrl: url as string}
    );
    // Updating BLOB local logic (especially, onSuccess)
    const onSubmit = async () => {
        console.log('submit');
        setUpdatableAgain(false);
        mutate(convertBackToFile(text));
    }
    const getIndex = (htmlString: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString.trim();

        const headings = tempDiv.querySelectorAll('h2, h3, h4, h5, h6') as NodeListOf<HTMLElement>;


        const index = Array.from(headings).map((n: HTMLElement) => {
            const a = `<a class="index-${n.nodeName}" href="#${n.id}">${n.innerText}</a>`
            return a
        })

        return `<div class="index">${index.join('\n')}</div>`

    }
    const manageReference = (myText: string) => {
        if (!myText) {
            return {redac: '', references: ''}
        }
        const biblioI = myText.indexOf("## Bibliography")
        let redac = myText.substring(0, biblioI + 15)
        let references = myText.substring(biblioI + 15)

        const refRx = new RegExp(/\[(\d+)]/g)
        // Replace each reference with a markdown link
        redac = redac.replace(refRx, (match, p1) => {
            return `[[${p1}]](#index-${p1})`;
        });

        const doiRx = new RegExp(/^(\[\d+].*?)\s([^\s]*)$/gim)
        // Replace each reference with a markdown link
        references = references.replace(doiRx, (match, p1, p2) => {
            if (p2.startsWith('https')) {
                p2 = p2.substring(17)
            }

            return `${p1} [${p2}](https://doi.org/${p2})`
            //return `[[${p1}]](#index-${p1})`;
        });

        return {redac, references}

    }
    return (
        <div className="redaction max-w-[60rem] mx-auto p-4 bg-white ml-">
            <div className="mx-36">
                <img alt="Blends Logo" src="https://blends.fr/blends-logo.svg"/>
            </div>
            {html &&
                <div dangerouslySetInnerHTML={
                    {__html: html}
                }/>
            }
        </div>
    );
}

const MarkdownPage = () => {
    return (
        // You could have a loading skeleton as the `fallback` too
        <Suspense>
            <Markdown/>
        </Suspense>
    )
}

export default MarkdownPage;
