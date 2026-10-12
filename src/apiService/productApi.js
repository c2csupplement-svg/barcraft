import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE;

function getAuthHeaders() {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("pm_admin_token")
      : null;

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

function getErrorResponse(error, defaultMessage) {
  if (error?.response) {
    console.error("HTTP Status:", error.response.status);
    console.error("Server Response:", error.response.data);

    let message = defaultMessage;

    if (typeof error.response.data === "string") {
      const match = error.response.data.match(/<pre>(.*?)<\/pre>/s);
      message = match?.[1] || error.response.data || defaultMessage;
    } else if (error.response.data?.message) {
      message = error.response.data.message;
    }

    return {
      success: false,
      message,
      status: error.response.status,
      error: error.response.data,
    };
  }

  if (error?.request) {
    return {
      success: false,
      message: "No response received from server.",
    };
  }

  console.error("Request error:", error?.message);

  return {
    success: false,
    message: error?.message || defaultMessage,
  };
}

function validateFormData(formData) {
  if (!(formData instanceof FormData)) {
    throw new Error("Product data must be provided as FormData.");
  }

  return formData;
}

export const createProduct = async (formData) => {
  try {
    validateFormData(formData);

    const response = await axios.post(
      `${API_URL}/api/product`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          Accept: "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Create product failed:", error);

    return getErrorResponse(
      error,
      "Product creation failed"
    );
  }
};

export const updateProduct = async (id, formData) => {
  try {
    const productId = String(id ?? "").trim();

    if (!productId) {
      return {
        success: false,
        message: "Invalid product ID",
      };
    }

    validateFormData(formData);

    const response = await axios.put(
      `${API_URL}/api/product/${encodeURIComponent(productId)}`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Update product failed:", error);

    return getErrorResponse(
      error,
      "Product update failed"
    );
  }
};

export const getProduct = async (page = 1, limit = 20) => {
  try {
    console.log(API_URL)
    const response = await axios.get(
      `${API_URL}/api/product/dashboard?page=${page}&limit=${limit}`,
      {
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Get products failed:", error);

    return getErrorResponse(
      error,
      "Failed to load products"
    );
  }
};

export const deleteProduct = async (id) => {
  try {
    const productId = String(id ?? "").trim();

    if (!productId) {
      return {
        success: false,
        message: "Invalid product ID",
      };
    }

    const response = await axios.delete(
      `${API_URL}/api/product/${encodeURIComponent(productId)}`,
      {
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Delete product failed:", error);

    return getErrorResponse(
      error,
      "Failed to delete product"
    );
  }
};

export const searchProduct = async (product, page=1, limit=20,) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/product/search?q=${encodeURIComponent(product)}&page=${page}&limit=${limit}`,
      {
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Search products failed:", error);

    return getErrorResponse(
      error,
      "Failed to load products"
    );
  }
};

export const updateProductStatus = async (productId, status) => {

  console.log(productId)
  try {
    const response = await axios.patch(
      `${API_URL}/api/product/status/${encodeURIComponent(productId)}`,
      { status },
      {
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Update product status failed:", error);

    return getErrorResponse(
      error,
      "Failed to update product status"
    );
  }
};

export const addReview = async (id, productReview) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/reviews/${encodeURIComponent(id)}`,
      productReview,
      {
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Add review failed:", error);

    return getErrorResponse(
      error,
      "Failed to add review"
    );
  }
};