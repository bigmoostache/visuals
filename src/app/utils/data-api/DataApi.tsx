// src/services/apiService.ts

const bFetch = async (url: string, method: string = "GET", body?: any) => {
  const baseUrl = "http://127.0.0.1:5000";

  const headers: any = {};

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${baseUrl}${url}`, {
    method: method.toLowerCase(),
    body: JSON.stringify(body),
    headers,
  });
  const data: { ok: boolean; body?: any } = await response.json();

  if (data.ok) {
    return data.body;
  } else {
    throw "Request failed";
  }
};

export const fetchProjects = async () => {
  try {
    const data = (await bFetch("/projects")) as Array<any>;

    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
  }
};

export const fetchProjectById = async (id: string) => {
  const response = await fetch(`/api/projects/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch project with id ${id}`);
  }
  return response.json();
};

export const changeHasPdf = async (doi: string, hasPdf?: boolean) => {
  const response = await bFetch("/has-pdf", "POST", { doi, has: hasPdf });
  if (!response.ok) {
    throw new Error(`Failed to change hasPdf for ${doi}`);
  }
  return response.json();
};
