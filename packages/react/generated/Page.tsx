import React from 'react';
import { Grid } from '../components/Grid';
interface Page {
  children?: React.ReactNode;
}

export const Page = (props: Page) => (
  <Grid styleMap={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24", padding: "32", width: "100%", minHeight: "100vh" }}>{props.children}</Grid>
);
