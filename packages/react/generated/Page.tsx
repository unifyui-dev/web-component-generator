import React from 'react';
import { Grid } from '../components/Grid';
import './Page.css';
interface Page {
  children?: React.ReactNode;
}

export const Page = (props: Page) => (
  <Grid className="page-root">{props.children}</Grid>
);
