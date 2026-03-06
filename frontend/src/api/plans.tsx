// const BASE_URL = 'http://localhost:3000/api';
//
// export const api = {
//     get: async <T,>(url: string): Promise<{ number, T }> => {
//         const res = await fetch(`${BASE_URL}${url}`, {
//         });
//         if (!res.ok) handleError(res);
//         return res.json() as Promise<T>;
//     },
//
//     post: async <T, B = unknown>(url: string, body: B): Promise<T> => {
//         const res = await fetch(`${BASE_URL}${url}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             credentials: 'include',
//             body: JSON.stringify(body),
//         });
//         if (!res.ok) handleError(res);
//         return res.json() as Promise<T>;
//     },
//
//     // PUT<T, B> - Full replace
//     put: async <T, B = unknown>(url: string, body: B): Promise<T> => {
//         const res = await fetch(`${BASE_URL}${url}`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             credentials: 'include',
//             body: JSON.stringify(body),
//         });
//         if (!res.ok) handleError(res);
//         return res.json() as Promise<T>;
//     },
//
//     // PATCH<T, B> - Partial update
//     patch: async <T, B = unknown>(url: string, body: B): Promise<T> => {
//         const res = await fetch(`${BASE_URL}${url}`, {
//             method: 'PATCH',
//             headers: { 'Content-Type': 'application/json' },
//             credentials: 'include',
//             body: JSON.stringify(body),
//         });
//         if (!res.ok) handleError(res);
//         return res.json() as Promise<T>;
//     },
//
//     // DELETE - No body response
//     del: async <_,>(url: string): Promise<void> => {
//         const res = await fetch(`${BASE_URL}${url}`, {
//             method: 'DELETE',
//             credentials: 'include',
//         });
//         if (!res.ok) handleError(res);
//     },
// }
//
