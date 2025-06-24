import { useState } from "react";
import axiosInstance from "./helpers/axios";
import Container from "./components/Container";
import Form from "./components/Form";
import { saveAs } from "file-saver";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [loading, setLoading] = useState(false);

  const handleFormSubmission = async (invoiceData) => {
    setLoading(true);

    try {
      const formData = new FormData();

      const {
        details: { companyLogo },
      } = invoiceData;

      // Append logo if present
      if (companyLogo) {
        formData.append("companyLogo", companyLogo);
      }

      // Clean up logo path in payload
      invoiceData.details.companyLogo = "";

      formData.append("invoiceData", JSON.stringify(invoiceData));

      // 📤 Create invoice
      const postResponse = await axiosInstance.post("/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(postResponse.data?.message || "Invoice created");

      // 📥 Download PDF
      const getResponse = await axiosInstance.get("/download", {
        responseType: "blob",
      });

      const invoicePdfBlob = new Blob([getResponse.data], {
        type: "application/pdf",
      });

      const invoicePreviewUrl = URL.createObjectURL(invoicePdfBlob);

      // Open in new tab
      window.open(invoicePreviewUrl, "_blank");

      // Optional download
      saveAs(invoicePdfBlob, `invoice_${Date.now()}.pdf`);
    } catch (e) {
      const errorMsg =
        e.response?.data?.error?.message ||
        "Something went wrong while creating invoice";
      toast.error(errorMsg);
      console.error("Invoice error:", e);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <div className="app">
      {loading && <Loader />}
      <Header />
      <Container>
        <Form onSubmit={handleFormSubmission} />
      </Container>
      <Footer />
      <ToastContainer
        position={toast.POSITION.BOTTOM_CENTER}
        autoClose={5000}
        hideProgressBar={true}
        draggable={false}
      />
    </div>
  );
}
