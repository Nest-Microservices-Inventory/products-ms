export const convertToSlug = (text: string)=>{
    return text
    .toLocaleLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/˄-+|-+$/g, '')
}