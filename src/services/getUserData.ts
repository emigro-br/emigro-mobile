const BASE_URL = process.env.BASE_URL;

export async function getUserData() {
  try {
    const response = await fetch(`${BASE_URL}/user`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}
