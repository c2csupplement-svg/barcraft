import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE;

function getAuthHeaders() {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("pm_admin_token")
      : null;

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

function getErrorResponse(
  error,
  defaultMessage
) {
  if (error?.response) {
    console.error(
      "HTTP Status:",
      error.response.status
    );

    console.error(
      "Server Response:",
      error.response.data
    );

    let message = defaultMessage;

    if (
      typeof error.response.data ===
      "string"
    ) {
      const text =
        error.response.data;

      const match = text.match(
        /<pre>(.*?)<\/pre>/s
      );

      message =
        match?.[1] ||
        text ||
        defaultMessage;
    } else if (
      error.response.data?.message
    ) {
      message =
        error.response.data.message;
    }

    return {
      success: false,
      message,
      status:
        error.response.status,
      error: error.response.data,
    };
  }

  if (error?.request) {
    console.error(
      "No response received from server."
    );

    return {
      success: false,
      message:
        "No response received from server.",
    };
  }

  console.error(
    "Request error:",
    error?.message
  );

  return {
    success: false,
    message:
      error?.message ||
      defaultMessage,
  };
}

export const createProductFormData = (productData) => {
  const formData = new FormData();

  const {
    id,
    name,
    slug,
    des,
    shortDes,
    overView,
    price,
    discountedPrice,
    featureImage,
    image,
    faq,
    seo,
    status,
  } = productData;

  if (id !== undefined && id !== null) {
    formData.append("id", String(id));
  }

  if (name !== undefined && name !== null) {
    formData.append("name", String(name));
  }

  if (slug !== undefined && slug !== null) {
    formData.append("slug", String(slug));
  }

  if (des !== undefined && des !== null) {
    formData.append("des", String(des));
  }

  if (shortDes !== undefined && shortDes !== null) {
    formData.append("shortDes", String(shortDes));
  }

  if (overView !== undefined && overView !== null) {
    formData.append("overView", String(overView));
  }

  if (price !== undefined && price !== null) {
    formData.append("price", String(price));
  }

  if (
    discountedPrice !== undefined &&
    discountedPrice !== null &&
    discountedPrice !== ""
  ) {
    formData.append("discountedPrice", String(discountedPrice));
  }

  if (seo !== undefined && seo !== null) {
    formData.append(
      "seo",
      JSON.stringify({
        title: seo?.title || "",
        description: seo?.description || "",
        keywords: Array.isArray(seo?.keywords) ? seo.keywords : [],
        author: seo?.author || "",
        canonicalUrl: seo?.canonicalUrl || "",
        robotsMeta: seo?.robotsMeta || "index, follow",
      })
    );
  } else {
    formData.append(
      "seo",
      JSON.stringify({
        title: "",
        description: "",
        keywords: [],
        author: "",
        canonicalUrl: "",
        robotsMeta: "index, follow",
      })
    );
  }

  formData.append("status", String(Boolean(status)));

  if (featureImage instanceof File) {
    formData.append("featureImage", featureImage);
  } else if (
    typeof featureImage === "string" &&
    featureImage.trim()
  ) {
    formData.append("featureImage", featureImage);
  }

  if (Array.isArray(image)) {
    const imageLayout = image.map((item) => {
      const file = item instanceof File ? item : item?.file;

      if (file instanceof File) {
        formData.append("image", file);
        return null;
      }

      if (typeof item === "string") {
        return item;
      }

      if (item?.url) {
        return item.url;
      }

      return null;
    });

    formData.append(
      "imageLayout",
      JSON.stringify(imageLayout)
    );
  } else {
    formData.append("imageLayout", JSON.stringify([]));
  }

  formData.append(
    "faq",
    JSON.stringify(Array.isArray(faq) ? faq : [])
  );

  return formData;
};

export const updateProduct = async (
  id,
  productData
) => {
  try {

 const productId = String(id || "").trim();

    if (!productId) {
      return {
        success: false,
        message: "Invalid product ID",
      };
    }


    const formData =
      createProductFormData(
        productData
      );


    const response =
      await axios.put(
        `${API_URL}/api/product/${productId}`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            Accept:
              "application/json",
          },
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Update product failed:",
      error
    );

    return getErrorResponse(
      error,
      "Product update failed"
    );
  }
};

export const createProduct = async (
  productData
) => {
  try {
    const formData =
      createProductFormData(
        productData
      );


    const response =
      await axios.post(
        `${API_URL}/api/product`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            Accept:
              "application/json",
          },
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Create product failed:",
      error
    );

    return getErrorResponse(
      error,
      "Product creation failed"
    );
  }
};

export const getProduct = async (page, limit) => {
    try {
        const response = await axios.get(
            `${API_URL}/api/product/dashboard/?page=${page}&limit=${limit}`,
            {
                headers: {
                    ...getAuthHeaders(),
                    Accept:
                        "application/json",
                },
            }
        );

        console.log(response)

        return response.data;
    } catch (error) {
        console.error(
            "Get products failed:",
            error
        );

        return getErrorResponse(
            error,
            "Failed to load products"
        );
    }
};

export const deleteProduct = async (id) => {
    try {

        // const productId = toInteger(id);
        const productId = id

        if (productId === null) {
            return {
                success: false,
                message:
                    "Invalid product ID",
            };
        }

        const response =
            await axios.delete(
                `${API_URL}/api/product/${productId}`,
                {
                    headers: {
                        ...getAuthHeaders(),
                        Accept:
                            "application/json",
                    },
                }
            );

        return response.data;
    } catch (error) {
        console.error(
            "Delete product failed:",
            error
        );

        return getErrorResponse(
            error,
            "Failed to delete product"
        );
    }
};

export const searchProduct = async (product) => {
    try {
        const response = await axios.get(
            `${API_URL}/api/product/search?q=${encodeURIComponent(product)}&all=true`,
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
        return getErrorResponse(error, "Failed to load products");
    }
};

export const updateProductStatus = async (
    productId,
    status
) => {
    const statusUrl =
        `${API_URL}/api/product/status/${productId}`;

    try {
        const response = await axios.patch(
            statusUrl,
            { status },
            {
                headers: getAuthHeaders(),
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Update product status failed:",
            error
        );

        return getErrorResponse(
            error,
            "Failed to update product status"
        );
    }
};

export const addReview = async (id,productReview) => {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE}/api/reviews/${id}`,
            productReview,
            {
                headers: getAuthHeaders(),
            }
        );

        return response.data;
    }
    catch (err) {
        console.error(
            "Update product status failed:",
            err
        );

        return getErrorResponse(
            err,
            "Failed to update product status"
        );
    }
}