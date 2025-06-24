// converts createdAt(mongoDb) to this format : "may 2025"
export function formatMemberSince(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${month} ${year}`;
}


 
// converts createdAt(mongoDb) to this format : "may  15 2025"
export function formatPublishDate(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${year}`;
}
