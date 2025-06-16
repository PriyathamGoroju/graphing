import React from 'react'
import GraphingTool from './GraphingTool'
import { Helmet } from 'react-helmet'

function index() {
  return (
    <div>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      <GraphingTool />
    </div>
  )
}

export default index