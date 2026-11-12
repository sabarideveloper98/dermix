import { useState } from "react";
import howToUseImage from "../assets/images/products/how_to_use_1_7973aaf5-82aa-4776-ac6c-d4940b181688.webp";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Box,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function ProductInfo({ product }) {
  const [expanded, setExpanded] = useState("false");
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ width: "100%", bgcolor: "#fff", color: "#000", py: 4 }}>


      {/* Heading */}
      <Box sx={{ textAlign: "center", mt: 12, mb: 3 }}>
        <Typography sx={{ color: "#9800e4", fontSize: 14, fontFamily: "cursive", fontWeight: 500 }}>
          WHAT IS SO SPECIAL ABOUT
        </Typography>

        <Typography
          component="h2"
          sx={{ fontSize: { xs: 27, md: 36 }, fontWeight: 800 }}
        >
          OUR COMPANY?
        </Typography>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          width: "fit-content",
          maxWidth: "100%",
          mx: "auto",
          border: "1px solid #919191",
          borderRadius: "40px",
          p: "4px",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          aria-label="Product information"
          sx={{
            minHeight: 40,
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTab-root": {
              minHeight: 40,
              minWidth: { xs: 95, sm: 145 },
              px: 1.5,
              borderRadius: "30px",
              color: "#000",
              fontWeight: 700,
              textTransform: "none",
              fontSize: { xs: 12, sm: 14 },
            },
            "& .MuiTab-root.Mui-selected": {
              bgcolor: "#7901ac",
              color: "#fff",
            },
          }}
        >
          <Tab label="How to use?" />
          <Tab label="What it does?" />
          <Tab label="Ingredients" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ maxWidth: 700, mx: "auto", mt: 5, textAlign: "center" }}>
        {tab === 0 && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            {product?.howToUseImage ? (
              <img
                src={product.howToUseImage}
                alt={`${product.name || "Product"} - How to use`}
                style={{ maxWidth: "100%", maxHeight: "550px", height: "auto", borderRadius: "8px", objectFit: "contain" }}
              />
            ) : (
              <img
                src={howToUseImage}
                alt="How to use"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            )}
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
            {product?.whatItDoesImage ? (
              <img
                src={product.whatItDoesImage}
                alt={`${product.name || "Product"} - What it does`}
                style={{ maxWidth: "100%", maxHeight: "550px", height: "auto", borderRadius: "8px", objectFit: "contain" }}
              />
            ) : (
              <Typography sx={{ color: "#444", fontSize: 16, py: 3 }}>
                {product?.benefit || "Product benefits and results."}
              </Typography>
            )}
          </Box>
        )}
        {tab === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {product?.ingredientsImage && (
              <Box sx={{ mb: 3, width: "100%", display: "flex", justifyContent: "center" }}>
                <img
                  src={product.ingredientsImage}
                  alt={`${product.name || "Product"} - Ingredients`}
                  style={{ maxWidth: "100%", maxHeight: "550px", height: "auto", borderRadius: "8px", objectFit: "contain" }}
                />
              </Box>
            )}
            {product?.ingredients && product.ingredients.length > 0 ? (
              product.ingredients.map((ing, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  {ing.percentage && (
                    <Typography variant="h4" sx={{ color: "#c97900" }}>
                      ({ing.percentage})
                    </Typography>
                  )}
                  <Typography variant="h5">{ing.name}</Typography>
                  {ing.description && (
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5, maxWidth: 500, mx: "auto" }}>
                      {ing.description}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              !product?.ingredientsImage && (
                <>
                  <Typography variant="h4" sx={{ color: "#c97900" }}>
                    (5%)
                  </Typography>
                  <Typography variant="h5">Niacinamide</Typography>

                  <Typography variant="h4" sx={{ color: "#c97900", mt: 3 }}>
                    (3%)
                  </Typography>
                  <Typography variant="h5">Panthenol</Typography>
                </>
              )
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}