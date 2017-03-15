import React from 'react';
import Navigation from '../../components/navigation/navigation.jsx';
import Highlight from 'react-highlight';
import S from 'stripmargin';

export default class Docs extends React.Component {
	constructor(props) {
		super(props);
	}
	handleChange(event) {
		this.setState({
			message: event.target.value
		});
	}
	render() {

		const codeBlock1 = S.stripMargin(`---
		|addSalesRepMultiregion:
		|  name: Add Sales Rep for Multiregion Accounts
		|  description: Fill out the forms below and hit submit to add sales rep.
		|`);

		const codeBlock2 = S.stripMargin(`---
		|addSalesRepMultiregion:
		|  # ...
		|  schema:
		|	type: object
		|	required:
		|	- account_number
		|	- sap_user_code
		|	- rep_name
		|	- email_lower
		|	properties:
		|	  account_number:
		|		pattern: "^[0-9]{10}$"
		|		type: string
		|		title: Account Number
		|	  sap_user_code:
		|		pattern: "^[0-9]{3}$"
		|		type: string
		|		title: SAP User Code
		|	  rep_name:
		|		type: string
		|		title: Rep Name
		|	  email_lower:
		|		type: string
		|		title: Email Lowercased
		|		format: email
		|`);

		const codeBlock3 = S.stripMargin(`addSalesRepMultiregion:
		|  # ...
		|  sql: >
		|	insert into accounts_to_sap_reps (account_id, sap_user_code, rep_name, user_id) values (
		|		(select account_id from accounts where account_number = $1),
		|		$2,
		|		$3,
		|		(select user_id from users where email_lower = $4)
		|	);
		|  sqlParams:
		|  - account_number
		|  - sap_user_code
		|  - rep_name
		|  - email_lower
		|`);

		const codeBlock4 = S.stripMargin(`addSalesRepMultiregion:
		|  # ...
		|  sqlAarrayFormat:
		|    shipment_numbers:
		|    - source_path like <% item %>
		|    - OR
		|  sql: >
		|    -- find sap documents (xml) by SAP shipment number
		|    SELECT
		|      document_id,
		|      feed_type,
		|      failed_message,
		|      process_state,
		|      source_path,
		|      state_changed AT TIME ZONE 'UTC'
		|    FROM sap_feed_documents
		|    WHERE
		|      feed_type = 'order_shipment' AND
		|      (<% shipment_numbers %>)
		|`);

		const codeBlock5 = S.stripMargin(`---
		|findSapXml:
		|  name: Find SAP XMLs by Shipment Number
		|  description: Enter shipment numbers to find corresponding SAP XML docs
		|  sqlAarrayFormat:
		|    shipment_numbers:
		|    - source_path like <% item %>
		|    - OR
		|  sql: >
		|    -- find sap documents (xml) by SAP shipment number
		|    SELECT
		|      document_id,
		|      feed_type,
		|      failed_message,
		|      process_state,
		|      source_path,
		|      state_changed AT TIME ZONE 'UTC'
		|    FROM sap_feed_documents
		|    WHERE
		|      feed_type = 'order_shipment' AND
		|      (<% shipment_numbers %>)
		|    ORDER BY state_changed DESC;
		|  schema:
		|    type: object
		|    required:
		|    - shipment_numbers
		|    properties:
		|      shipment_numbers:
		|        type: array
		|        title: A list of shipment numbers
		|        items:
		|          type: string
		|`);

		return <div id='page-docs'>
				<Navigation />
				<h1>Documentation</h1>
				<h2>Runbook DSL</h2>
				<p>
					The Runbook DSL is described in YAML (http://www.yaml.org/).
				</p>
				<h3>ID, Name & Description</h3>
				<p>
					Runbooks are unique and should start with a key which corresponds to the unique id used to define that particular runbook.
					Each runbook should also contain a <em>name</em> and <em>description</em> field, to describe the purpose of the runbook.
					These fields will also be indexed for search.
				</p>

				<Highlight className="yaml">{codeBlock1}</Highlight>
				<h3>Input Schema</h3>
				<p>
					Each runbook accepts inputs. The shape or schema of a runbook input is defined by a JSON Schema (http://json-schema.org/)
					See the code below for an example:
				</p>
				<Highlight className="yaml">{codeBlock2}</Highlight>
				<p>This schema will generate an input form on the web UI.</p>
				<img src="//i.imgur.com/4R9GpMW.png"/>
				<p> It will also be used to check validation on the input before being executed</p>
				<img src="//i.imgur.com/CVRi9O1.png"/>
				<h3>Executors</h3>
				<p>
					Each runbook has optional exuctors that will execute a task, such as run a SQL query, or make an HTTP request.
				</p>
				<h3>SQL Executor</h3>
				<p>
					SQL Executors define a paramaterized SQL query to be run when the user posts valid input.
					This paramaterized query is defined by a <em>sql</em> paramater, and a <em>sqlParams</em> parameter.
				</p>
				<Highlight className="yaml">{codeBlock3}</Highlight>
				<p>Arrays in queries (such as used for where clauses) can be support using the <em>sqlAarrayFormat</em> property.
				<em>sqlAarrayFormat</em> is an object where each key is an array input type. Those keys contain an array value where the first index is the template which is joined by an optional second paramater (e.g <em>OR</em>, or <em>AND</em>) The array uses ejs/lodash style injection of the input into the template (e.g <em>&lt;% account_numbers %&gt;</em>).
				string inputs are automatically escaped using pg-escape (https://github.com/segmentio/pg-escape)
				</p>
				<Highlight className="yaml">{codeBlock4}</Highlight>
				<p>
					Currently Runbooks support PostgreSQL but there are plans too support other dialects (MSSQL, MYSQL) soon.
				</p>

				<h3> All together now!</h3>
				<p>Below is an example runbook that encorporates note all the components from above.</p>
				<p>Please take note of the lessons above</p>
				<Highlight className="yaml">{codeBlock5}</Highlight>
		</div>;
	}
}
