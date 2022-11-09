import React, { useState, useEffect, useMemo } from "react";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Space, Typography, Tabs, Button } from 'antd';
import {DownloadOutlined} from "@ant-design/icons"

import { useLocation, useNavigate, useParams } from "react-router-dom";
import config from "../config";
import axios from "axios";
import Iframe from 'react-iframe'
import PipeLineDag from "./PipeLineDag";
import Tree from "./Tree"
const { Text, Link } = Typography;

const PhyloNextResults = () => {
  
const [mapExists, setMapExists] = useState(false)
const [activeKey, setActiveKey] = useState("1")
  let params = useParams();

  useEffect(() => {

    const checkMapExists = async () => {
        try {
            const res = await axios.head(`${config.phylonextWebservice}/job/${params?.id}/cloropleth.html`);
            if (res?.status === 200){
                setMapExists(true)
            };
        } catch (error) {
            setActiveKey("2")
            setMapExists(false)
        }
    }
    checkMapExists()
  },[])
  


  return (
   
        <Tabs
    //defaultActiveKey={mapExists ? "1": "2"}
    activeKey={activeKey}
    onChange={setActiveKey}
    tabBarExtraContent={
      {
        right: <Button href={`${config.phylonextWebservice}/job/${params?.id}/archive.zip`}>Download results <DownloadOutlined /></Button>
      }
    }
    items={[
      
      {
        label: `Map`,
        key: '1',
        disabled: !mapExists,
        children: <Iframe url={`${config.phylonextWebservice}/job/${params?.id}/cloropleth.html`}
        width="100%"
        height="700px"
        id=""
        className=""
        display="block"
        position="relative"/>,
      },
      {
        label: `Execution report`,
        key: '2',
       // disabled: !completed,
        children: <Iframe url={`${config.phylonextWebservice}/job/${params?.id}/execution_report.html`}
        width="100%"
        height="700px"
        id=""
        className=""
        display="block"
        position="relative"/>,
      },
      {
        label: `Pipeline visualization (DAG)`,
        key: '3',
        //disabled: !completed,
        children: <PipeLineDag jobid={params?.id} />,
      },
      /*  {
        label: `Phylogenetic tree`,
        key: '4',
        children: <Tree  />,
      },  */
    ]}
  />

    
  );
};

export default PhyloNextResults;
