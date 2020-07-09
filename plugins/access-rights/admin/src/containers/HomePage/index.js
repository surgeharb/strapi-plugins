/*
 *
 * HomePage
 *
 */

import React, { memo, useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';

import {
  request,
  PluginHeader,
} from "strapi-helper-plugin";

import Row from "../../components/Row";
import Block from "../../components/Block";
import { Select, Label, Checkbox } from "@buffetjs/core";

const HomePage = () => {
  const [currentRole, setCurrentRole] = useState('author');
  const [roles, setRoles] = useState(['author', 'editor']);

  const [contentTypes, setContentTypes] = useState([]);
  const [accessRights, setAccessRights] = useState({});

  const refreshAccessRights = async () => {
    const data = await request(`/admin-accesses?role=${currentRole}`);
    setAccessRights(data[0]);
  };

  const onCheck = async (uid, value) => {
    if (!accessRights || !accessRights.id) {
      const body = { role: currentRole, plugins: [{ uid }] };
      await request('/admin-accesses', { method: 'POST', body });
    } else {
      const body = { ...accessRights };

      if (value === true) {
        body.plugins.push({ uid });
      } else {
        body.plugins = body.plugins.filter(p => p.uid !== uid);
      }

      await request(`/admin-accesses/${accessRights.id}`, { method: 'PUT', body });
    }

    refreshAccessRights();
  };

  useEffect(() => {
    request('/content-manager/content-types').then(response => {
      setContentTypes(response.data);
    });
  }, []);

  useEffect(() => {
    refreshAccessRights();
  }, [currentRole]);

  return (
    <div className={"container-fluid"} style={{ padding: "18px 30px" }}>
      <PluginHeader
        title={"Access Rights"}
        description={"Configure Administrators Access"}
      />
      <div className="row">
        <Block
          title="Administrator Roles"
          style={{ marginBottom: 12 }}
        >
          <Row className={"row"}>
            <div className={"col-4"}>
              <Label htmlFor="importSource">Role</Label>
              <Select
                name="importSource"
                options={roles}
                value={currentRole}
                onChange={({ target: { value } }) =>
                  setCurrentRole(value)
                }
              />
            </div>
          </Row>
          <Row className={"row"}>
            <div className={"col-4"}>
              {
                contentTypes.map(type => (
                  <Checkbox
                    key={type.uid}
                    name={type.uid}
                    message={`${type.schema.kind}: ${type.label}`}
                    onChange={({ target }) => onCheck(type.uid, target.value)}
                    value={(accessRights && accessRights.id !== undefined) ? !!accessRights.plugins.find(p => p.uid === type.uid) : false}
                  />
                ))
              }
            </div>
          </Row>
        </Block>
      </div>
    </div>
  );
};

export default memo(HomePage);
