import React from 'react';
import { Container } from '../components/Container';
import { Text } from '../components/Text';
import './Breadcrumbs.css';
interface Breadcrumbs {
  styleMap: {
    "--breadcrumb-link-color": string;
  };
  data: {
    breadcrumb1: string;
    breadcrumb2: string;
    breadcrumb3: string;
  };
  children?: React.ReactNode;
}

export const Breadcrumbs = (props: Breadcrumbs) => (
  <Container style={{ "--breadcrumb-link-color": props.styleMap?.["--breadcrumb-link-color"] }} className="breadcrumbs-root"><Text className="breadcrumbs-root-container-0" data={{ content: props.data?.breadcrumb1 }}>{props.data?.breadcrumb1}</Text><Text className="breadcrumbs-root-container-1" data={{ content: "/" }}>/</Text><Text className="breadcrumbs-root-container-2" data={{ content: props.data?.breadcrumb2 }}>{props.data?.breadcrumb2}</Text><Text className="breadcrumbs-root-container-3" data={{ content: "/" }}>/</Text><Text className="breadcrumbs-root-container-4" data={{ content: props.data?.breadcrumb3 }}>{props.data?.breadcrumb3}</Text>{props.children}</Container>
);
