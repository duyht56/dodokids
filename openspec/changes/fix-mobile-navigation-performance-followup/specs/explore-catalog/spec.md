## ADDED Requirements

### Requirement: Catalog thumbnails are sized for their display footprint
Bundled Explore thumbnail assets SHALL be stored at a resolution close to their largest rendered footprint (512×512 per the asset folder contract), not at generation resolution. Re-entering the catalog tab MUST show previously displayed thumbnails immediately; a thumbnail still decoding on first mount SHALL show the card's existing emoji/placeholder treatment rather than an empty image region.

#### Scenario: Thumbnail asset is oversized
- **WHEN** a thumbnail asset larger than the 512×512 contract is added to the bundle
- **THEN** it is downscaled before shipping, keeping the decoded-bitmap cost proportional to what the card actually renders

#### Scenario: Re-entering the catalog
- **WHEN** the child leaves the Explore tab and returns to it
- **THEN** card thumbnails are visible immediately without a re-decode blank
