const BASE_URL = process.env.BASE_URL;

export async function getUser() {
  try {
    const response = await fetch(`${BASE_URL}/user`);
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}
