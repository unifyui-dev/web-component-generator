import React from 'react';
import { Container } from '../components/Container';
import { Text } from '../components/Text';
interface Breadcrumbs {
  breadcrumb1: string;
  breadcrumb2: string;
  breadcrumb3: string;
  breadcrumbLinkColor: string;
  children?: React.ReactNode;
}

export const Breadcrumbs = (props: Breadcrumbs) => (
  <Container styleMap={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, padding: 16 }}><Text styleMap={{ color: props.breadcrumbLinkColor, fontSize: 14, textDecoration: "underline", cursor: "pointer" }} data={{ content: props.breadcrumb1 }}>{props.breadcrumb1}</Text><Text styleMap={{ color: "#666666", fontSize: 14 }} data={{ content: "/" }}>/</Text><Text styleMap={{ color: props.breadcrumbLinkColor, fontSize: 14, textDecoration: "underline", cursor: "pointer" }} data={{ content: props.breadcrumb2 }}>{props.breadcrumb2}</Text><Text styleMap={{ color: "#666666", fontSize: 14 }} data={{ content: "/" }}>/</Text><Text styleMap={{ color: "#333333", fontSize: 14, fontWeight: "500" }} data={{ content: props.breadcrumb3 }}>{props.breadcrumb3}</Text>{props.children}</Container>
);
