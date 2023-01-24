import React, { useState, useEffect } from "react";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import country from "../Vocabularies/country.json"
import basisOfRecord from "../Vocabularies/basisOfRecord.json"
import _ from "lodash"
import {
  Form,
  InputNumber,
  Button,
  Select,
  Collapse,
  Typography,
  Checkbox,
  Input
} from "antd";
import PhyloTreeInput from "../Components/PhyloTreeInput";
import { useNavigate } from "react-router-dom";
import biodiverseIndices from "../Vocabularies/BiodiverseIndices.json";
import TaxonAutoComplete from "../Components/TaxonAutocomplete";
import {axiosWithAuth} from "../Auth/userApi";

import axios from "axios";
import config from "../config";
import Map from "./Map";
import withContext from "../Components/hoc/withContext";

const { Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 16 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const PhyloNextForm = ({setStep, preparedTrees, user, logout}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [h3resolution, setH3resolution] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {

    if(!user){
      logout()
    }
  }, [user])
  const onFinishFailed = ({ errorFields }) => {
    form.scrollToField(errorFields[0].name);
  };
  const getCoords = (boundingBox) => {
    return {
      latmin: Math.min(...boundingBox.map((e) => e.lat)),
      latmax: Math.max(...boundingBox.map((e) => e.lat)),
      lonmin: Math.min(...boundingBox.map((e) => e.lng)),
      lonmax: Math.max(...boundingBox.map((e) => e.lng)),
    };
  };
  const getArraryData = (values) => {

     return ["phylum", "classis", "order", "family", "genus", "country", "basisofrecordinclude", "basisofrecordexclude"].reduce((acc, curr) => {
     if(_.isArray(values[curr]) && values[curr].length > 0){
      acc[curr] = `"${values[curr].toString()}"`
     }
     return acc;
     }  ,{})
  }
  const onFinish = async (values) => {
    //  alert(JSON.stringify(values))
    let nonEmptyFields = Object.fromEntries(
      Object.entries(values).filter(
        ([k, v]) => v != null && !["boundingBox", "phylum", "classis", "order", "family", "genus", "country"].includes(k)
      )
    );
    nonEmptyFields = {...nonEmptyFields, ...getArraryData(values)}
    if (values?.boundingBox?.[0]) {
      nonEmptyFields = {
        ...nonEmptyFields,
        ...getCoords(values.boundingBox[0]),
      };
    }
    try {
      console.log(nonEmptyFields);

      setLoading(true);
      const res = await axiosWithAuth.post(
        `${config.phylonextWebservice}`,
        nonEmptyFields
      );
      const jobid = res?.data?.jobid;
      setStep(1)
      navigate(`/run/${jobid}`);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  return (
    
        <Form
          form={form}
          disabled={loading}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          labelWrap={true}
          initialValues={{
            genus: [],
            family: [],
            order: [],
            classis: [],
            phylum: [],
            randname: 'rand_structured',
            h3resolution: 2
          }}
        >
          <Collapse defaultActiveKey={"1"}>
          <Panel header="Name and description" key="0">
          <Form.Item
           {...formItemLayout}
          name="jobName"
          label="Name"
          extra={"You can give your pipeline run a name that will help you distinguish it (Optional)"}
        >
          <Input />
        </Form.Item>
        <Form.Item
         {...formItemLayout}
          name="jobDescription"
          label="Description"
          extra={"Further notes or information about the run (Optional)"}
        >
          <Input.TextArea />
        </Form.Item>
          </Panel>
            <Panel header="Phylogeny" key="1">
              <FormItem
                {...formItemLayout}
                name="phylabels"
                label="Type of phylogenetic tree labels (OTT or Latin)"
              >
                <Select allowClear>
                  {["OTT", "Latin"].map((i) => (
                    <Option key={i}>{i}</Option>
                  ))}
                </Select>
              </FormItem>

              <FormItem
                {...formItemLayout}
                name="taxgroup"
                label="Taxgroup for matching species names to the Open Tree Taxonomy"
              >
                <Select>
                  <Option value="'All life'" label="All life ">
                    <Text>All life </Text>
                    <br />
                  </Option>
                  <Option value="Animals" label="Animals">
                    <Text>Animals</Text>
                    <br />
                    <Text type="secondary">
                      Birds, Tetrapods, Mammals, Amphibians, Vertebrates
                      Arthropods, Molluscs, Nematodes, Platyhelminthes, Annelids
                      Cnidarians, Arachnids, Insects
                    </Text>
                  </Option>
                  <Option value="Fungi" label="Fungi">
                    <Text>Fungi</Text>
                    <br />
                    <Text type="secondary">Basidiomycetes, Ascomycetes</Text>
                  </Option>
                  <Option value="'Land plants'" label="Land plants">
                    <Text>Land plants</Text>
                    <br />
                    <Text type="secondary">
                      Hornworts, Mosses, Liverworts, Vascular plants, Club
                      mosses Ferns, Seed plants, Flowering plants, Monocots,
                      Eudicots Rosids, Asterids, Asterales, Asteraceae, Aster
                      Symphyotrichum, Campanulaceae, Lobelia
                    </Text>
                  </Option>
                  <Option value="Bacteria" label="Bacteria">
                    <Text>Bacteria</Text>
                    <br />
                    <Text type="secondary">
                      SAR group, Archaea, Excavata, Amoebozoa, Centrohelida
                      Haptophyta, Apusozoa, Diatoms, Ciliates, Forams
                    </Text>
                  </Option>
                  
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                name="prepared_phytree"
                label="Choose a predefined tree from OTL"
                extra={<span>The pipeline comes with <a href="https://github.com/vmikk/PhyloNext/tree/main/test_data/phy_trees" target="_blank">some predefined trees</a> trees from OTL</span>}
              >
                <Select style={{width: 200}} allowClear>
                    {preparedTrees.map(key => <Option key={key}>{key}</Option>)}
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                name="phytree"
                label="Phylogenetic tree in newick format (phytree param)"
                extra="You can supply your own tree in Newick format"
              >
                <PhyloTreeInput />
                {/* <Input.TextArea></Input.TextArea> */}
              </FormItem>
            </Panel>
            <Panel header="Taxonomic filters" key="2">
              <FormItem {...formItemLayout} name="phylum" label="Phylum">
                <TaxonAutoComplete rank="phylum" />
              </FormItem>
              <FormItem {...formItemLayout} name="classis" label="Class">
                <TaxonAutoComplete rank="class" />
              </FormItem>
              <FormItem {...formItemLayout} name="order" label="Order">
                <TaxonAutoComplete rank="order" />
              </FormItem>
              <FormItem {...formItemLayout} name="family" label="Family">
                <TaxonAutoComplete rank="family" />
              </FormItem>
              <FormItem {...formItemLayout} name="genus" label="Genus">
                <TaxonAutoComplete rank="genus" />
              </FormItem>
            </Panel>
            <Panel header="Spatial and temporal filters" key="3">
           

              <FormItem {...formItemLayout} name="country" label="Country">
                <Select 
                    mode="multiple" 
                    allowClear 
                    showSearch
                    filterOption={(input, option) => {
                        return option.children
                          .toLowerCase()
                          .startsWith(input.toLowerCase());
                      }}>
                  {country.map((i) => (
                    <Option key={i.alpha2}>{i.name}</Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem {...formItemLayout} name="boundingBox" label="Area">
                <Map />
              </FormItem>

              <FormItem
                {...formItemLayout}
                name="minyear"
                label="Min year"
                extra="Minimum year of record's occurrences"
              >
                <InputNumber />
              </FormItem>
            </Panel>
            <Panel header="GBIF Occurrence filtering and aggregation" key="4">
            <FormItem {...formItemLayout} name="basisofrecordinclude" label="Include BasisOfRecord">
                <Select 
                    mode="multiple" 
                    allowClear 
                    style={{width: "400px"}}
                    >
                  {basisOfRecord.map((i) => (
                    <Option key={i}>{i}</Option>
                  ))}
                </Select>
              </FormItem>

              <FormItem {...formItemLayout} name="basisofrecordexclude" label="Exclude BasisOfRecord">
                <Select 
                    mode="multiple" 
                    allowClear 
                    style={{width: "400px"}}
                    >
                  {basisOfRecord.map((i) => (
                    <Option key={i}>{i}</Option>
                  ))}
                </Select>
              </FormItem>
            <Form.Item
                {...formItemLayout}
                name="terrestrial"
                label="Use Land polygon for removal of non-terrestrial occurrences"
                extra="This will use the pipeline_data/Land_Buffered_025_dgr.RData file from the PhyloNext pipeline repository"
                valuePropName="checked"
              >
                <Checkbox />
                
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                name="rmcountrycentroids"
                label="Remove data from polygons with country and province centroids"
                extra="This will use the pipeline_data/CC_CountryCentroids_buf_1000m.RData file from the PhyloNext pipeline repository"
                valuePropName="checked"
              >
                <Checkbox />
                
              </Form.Item>

              <Form.Item
                {...formItemLayout}
                name="rmcountrycapitals"
                label="Remove data from polygons with with country capitals"
                extra="This will use the pipeline_data/CC_Capitals_buf_10000m.RData file from the PhyloNext pipeline repository"
                valuePropName="checked"
              >
                <Checkbox />
                
              </Form.Item>

              <Form.Item
                {...formItemLayout}
                name="rminstitutions"
                label="Remove data from polygons with biological institutuions and museums"
                extra="This will use the pipeline_data/CC_Institutions_buf_100m.RData file from the PhyloNext pipeline repository"
                valuePropName="checked"
              >
                <Checkbox />
                
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                name="rmurban"
                label="Remove data from polygons with urban areas"
                extra="This will use the pipeline_data/CC_Urban.RData file from the PhyloNext pipeline repository"
                valuePropName="checked"
              >
                <Checkbox />
                
              </Form.Item>
              
              

              <Form.Item
                {...formItemLayout}
                name="dbscan"
                label="DBSCAN"
                extra="Logical, remove spatial outliers with density-based clustering"
                valuePropName="checked"
              >
                <Checkbox />
              </Form.Item>
              <FormItem
                {...formItemLayout}
                name="dbscannoccurrences"
                label="Minimum species occurrence to perform DBSCAN"
              >
                <InputNumber />
              </FormItem>
              <FormItem
                {...formItemLayout}
                name="dbscanepsilon"
                label="DBSCAN parameter epsilon, km"
              >
                <InputNumber />
              </FormItem>
              <FormItem
                {...formItemLayout}
                name="dbscanminpts"
                label="DBSCAN min number of points"
              >
                <InputNumber />
              </FormItem>
              
                
            </Panel>
            <Panel header="Biodiverse settings" key="5">
            <FormItem
                hasFeedback={h3resolution > 3 }
                validateStatus={h3resolution> 3 ? "warning": null }
                help={h3resolution > 3 ? "Be ware that higher values should only be applied for smaller geographical areas": null }
                {...formItemLayout}
                name="h3resolution"
                label="H3 resolution (Polygon size)"
                /* extra="Pick a higher value for smaller areas" */
              >
                 <Select defaultValue={2} style={{width: 100}} onChange={setH3resolution}>
                    {[1,2,3,4].map(key => <Option key={key}>{key}</Option>)}
                 </Select>
                {/* <InputNumber /> */}
              </FormItem>

              <FormItem {...formItemLayout} name="randname" label="Randomisation name">
                <Select >
                  {['rand_structured', 'rand_independent_swaps'].map((i) => (
                    <Option key={i}>{i}</Option>
                  ))}
                </Select>
                </FormItem>
                <FormItem
                {...formItemLayout}
                name="iterations"
                label="Number of randomisation iterations (max 1000)"
              >
                <InputNumber max={1000} />
              </FormItem>

            </Panel>
          </Collapse>

          {/* <FormItem {...formItemLayout} name="indices" label="Indices">
            <Select mode="multiple" allowClear>
              {biodiverseIndices.map((i) => (
                <Option key={i}>{i}</Option>
              ))}
            </Select>
          </FormItem> */}

          <FormItem style={{ marginTop: "10px" }} extra={!user ? 'Please login to start the pipeline' : null}>
            <Button loading={loading} type="primary" disabled={!user} htmlType="submit">
              Start pipeline run
            </Button>
          </FormItem>
        </Form>
      
  );
};

const mapContextToProps = ({ step, setStep, runID, setRunID, preparedTrees, user, logout }) => ({
    step, setStep, runID, setRunID , preparedTrees, user, logout
  });
export default withContext(mapContextToProps)(PhyloNextForm);
