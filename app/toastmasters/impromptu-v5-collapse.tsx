import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export function ImpromptuSpeechV5Collapse() {
  return (
    <div>
      <Accordion sx={{ backgroundColor: "#f5f5f5" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Evaluation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            I stay up-to-date with market trends and competition by actively
            engaging in industry publications, attending relevant conferences,
            and participating in webinars. Additionally, I regularly conduct
            competitor analysis to understand their product offerings and
            positioning. This helps me gather valuable insights and identify
            areas where we can differentiate our product. I also make it a point
            to gather user feedback through user research studies and monitor
            customer reviews. By combining both qualitative and quantitative
            data, I can make informed decisions and adjust our product strategy
            accordingly.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ backgroundColor: "#f5f5f5" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Revised Speech</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            I stay up-to-date with market trends and competition by actively
            engaging in industry publications, attending relevant conferences,
            and participating in webinars. Additionally, I regularly conduct
            competitor analysis to understand their product offerings and
            positioning. This helps me gather valuable insights and identify
            areas where we can differentiate our product. I also make it a point
            to gather user feedback through user research studies and monitor
            customer reviews. By combining both qualitative and quantitative
            data, I can make informed decisions and adjust our product strategy
            accordingly.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ backgroundColor: "#f5f5f5" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Sample Speech</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            I stay up-to-date with market trends and competition by actively
            engaging in industry publications, attending relevant conferences,
            and participating in webinars. Additionally, I regularly conduct
            competitor analysis to understand their product offerings and
            positioning. This helps me gather valuable insights and identify
            areas where we can differentiate our product. I also make it a point
            to gather user feedback through user research studies and monitor
            customer reviews. By combining both qualitative and quantitative
            data, I can make informed decisions and adjust our product strategy
            accordingly.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ backgroundColor: "#f5f5f5" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>More</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            I stay up-to-date with market trends and competition by actively
            engaging in industry publications, attending relevant conferences,
            and participating in webinars. Additionally, I regularly conduct
            competitor analysis to understand their product offerings and
            positioning. This helps me gather valuable insights and identify
            areas where we can differentiate our product. I also make it a point
            to gather user feedback through user research studies and monitor
            customer reviews. By combining both qualitative and quantitative
            data, I can make informed decisions and adjust our product strategy
            accordingly.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
