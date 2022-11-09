# PhyloNext - PD (Phylogenetic Diversity) in the cloud

The automated pipeline for the analysis of phylogenetic diversity using [GBIF occurrence data](https://www.gbif.org/occurrence/search?occurrence_status=present), species phylogenies from [Open Tree of Life](https://tree.opentreeoflife.org), and [Biodiverse software](https://shawnlaffan.github.io/biodiverse/).

## Introduction

Current pipeline brings together two critical research data infrastructures, the Global
Biodiversity Information Facility [(GBIF)](https://www.gbif.org/) and Open Tree of Life [(OToL)](https://tree.opentreeoflife.org), to make them more accessible to non-experts.

The pipeline is built using [Nextflow](https://www.nextflow.io), a workflow tool to run tasks across multiple compute infrastructures in a very portable manner. It uses [Docker](https://www.docker.com/) containers making installation trivial and results highly reproducible. The [Nextflow DSL2](https://www.nextflow.io/docs/latest/dsl2.html) implementation of this pipeline uses one container per process which makes it much easier to maintain and update software dependencies.

The pipeline could be launched in a cloud environment (e.g., the [Microsoft Azure Cloud Computing Services](https://azure.microsoft.com/en-us/), [Amazon AWS Web Services](https://aws.amazon.com/), and [Google Cloud Computing Services](https://cloud.google.com/)).

## Pipeline summary

1. Filtering of GBIF species occurrences for various taxonomic clades and geographic areas
2. Removal of non-terrestrial records and spatial outliers (using density-based clustering)
3. Preparation of phylogenetic tree (currently, only pre-constructed phylogenetic trees are available; with the update of OToL, phylogenetic trees will be downloaded automatically using API) and name-matching with GBIF species keys
4. Spatial binning of species occurrences using Uber’s H3 system (hexagonal hierarchical spatial index)
5. Estimation of phylogenetic diversity and endemism indices using [Biodiverse program](https://shawnlaffan.github.io/biodiverse/)
6. Visualization of the obtained results (to be implemented soon)


```
OPTIONAL:
    --phylum              Phylum to analyze (multiple comma-separated values allowed); e.g., "Chordata"
    --class               Class to analyze (multiple comma-separated values allowed); e.g., "Mammalia"
    --order               Order to analyze (multiple comma-separated values allowed); e.g., "Carnivora"
    --family              Family to analyze (multiple comma-separated values allowed); e.g., "Felidae,Canidae"
    --country             Country code, ISO 3166 (multiple comma-separated values allowed); e.g., "DE,PL,CZ"
    --latmin              Minimum latitude of species occurrences (decimal degrees); e.g., 5.1
    --latmax              Maximum latitude of species occurrences (decimal degrees); e.g., 15.5
    --lonmin              Minimum longitude of species occurrences (decimal degrees); e.g., 47.0
    --lonmax              Maximum longitude of species occurrences (decimal degrees); e.g., 55.5
    --minyear             Minimum year of record's occurrences; default, 1945
    --noextinct           File with extinct species specieskeys for their removal
    --roundcoords         Logical, round spatial coordinates to two decimal places, to reduce the dataset size (default, TRUE)
    --h3resolution        Spatial resolution of the H3 geospatial indexing system; e.g., 4
    --dbscan              Logical, remove spatial outliers with density-based clustering; e.g., "false"
    --dbscannoccurrences  Minimum species occurrence to perform DBSCAN; e.g., 30
    --dbscanepsilon       DBSCAN parameter epsilon, km; e.g., "700"
    --dbscanminpts        DBSCAN min number of points; e.g., "3"
    --terrestrial         Land polygon for removal of non-terrestrial occurrences; e.g., "pipeline_data/Land_Buffered_025_dgr.RData"
    --wgsrpd              Polygons of World Geographical Regions; e.g., "pipeline_data/WGSRPD.RData"
    --regions             Names of World Geographical Regions; e.g., "L1_EUROPE,L1_ASIA_TEMPERATE"
    --indices             Comma-seprated list of diversity and endemism indices; e.g., "calc_richness,calc_pd,calc_pe"
    --randname            Randomisation scheme type; e.g., "rand_structured"
    --iterations          Number of randomisation iterations; e.g., 1000

```

## Funding

The work is supported by a grant “PD (Phylogenetic Diversity) in the Cloud” to GBIF Supplemental funds from the GEO-Microsoft Planetary Computer Programme.
## Future plans

- Add support of [`Shifter`](https://nersc.gitlab.io/development/shifter/how-to-use/) or [`Charliecloud`](https://hpc.github.io/charliecloud/) containers.

