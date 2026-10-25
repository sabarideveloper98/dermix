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

export default function ProductInfo() {
  const [expanded, setExpanded] = useState("false");
  const [tab, setTab] = useState(2);

  return (
    <Box sx={{ width: "100%", bgcolor: "#fff", color: "#000", py: 4 }}>
      {/* Accordion */}
      <Box sx={{ maxWidth: 740, mx: "auto" }}>
        {[
          {
            id: "ingredients",
            title: "Why dermfix",
            content: "Discover the ingredients and their benefits.",
          },
          {
            id: "description",
            title: "Ingretiends",
            content: "Learn more about this skincare product.",
          },
        ].map((item) => (
          <Accordion
            key={item.id}
            expanded={expanded === item.id}
            onChange={(_, isExpanded) =>
              setExpanded(isExpanded ? item.id : false)
            }
            disableGutters
            elevation={0}
            sx={{
              borderBottom: "1px solid #919191",
              borderRadius: 0,
              "&:before": { display: "none" },
              "&.Mui-expanded": { borderColor: "#777" },
            }}
          >
            <AccordionSummary
              expandIcon={
                expanded === item.id ? <RemoveIcon /> : <AddIcon />
              }
              sx={{ px: 0.5, minHeight: 58 }}
            >
              <Typography style={{fontWeight:600}}>{item.title}</Typography>
            </AccordionSummary>

            <AccordionDetails>
              {item.content}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Heading */}
      <Box sx={{ textAlign: "center", mt: 12, mb: 3 }}>
        <Typography sx={{ color: "#9800e4", fontSize: 14 , fontFamily: "cursive",fontWeight:500 }}>
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
        {tab === 0 && <Typography>
            <img
    src="{howToUseImage}"
    alt="How to use"
    style={{ maxWidth: "100%", height: "auto" }}
  />
        </Typography>}
        {tab === 1 && <Typography>Product benefits and results.</Typography>}
        {tab === 2 && (
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
        )}
      </Box>
    </Box>
  );
}