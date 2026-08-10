/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Rate, message } from 'antd';
import { ClickableFieldModel, FieldModel } from '@nocobase/client';
import { DisplayItemModel, EditableItemModel, FilterableItemModel, tExpr } from '@nocobase/flow-engine';
import { useT } from '../locale';

const MAX_RATING = 5;

interface RatingDisplayProps {
  value: number;
  model: DisplayRatingFieldModel;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ value, model }) => {
  const [currentValue, setCurrentValue] = useState<number>(value ?? 0);
  const [loading, setLoading] = useState(false);
  const t = useT();

  const handleChange = async (newValue: number) => {
    const record = model.context?.record;
    const collection = model.context?.collection;
    const collectionField = model.context?.collectionField;
    const app = (model.context as any)?.app;

    if (!record || !collection || !collectionField || !app) {
      setCurrentValue(newValue);
      return;
    }

    const fieldName = collectionField.name;
    const collectionName = collection.name;
    const filterByTk = collection.getFilterByTK?.(record) ?? record.id;

    setLoading(true);
    try {
      await app.apiClient.request({
        url: `${collectionName}:update`,
        params: { filterByTk },
        method: 'post',
        data: { [fieldName]: newValue },
      });
      setCurrentValue(newValue);
      message.success(t('Rating updated'));
    } catch (e) {
      message.error(t('Failed to update rating'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Rate
      allowHalf
      count={MAX_RATING}
      value={currentValue}
      onChange={handleChange}
      disabled={loading}
    />
  );
};

export class DisplayRatingFieldModel extends ClickableFieldModel {
  renderComponent(value: number) {
    return <RatingDisplay value={value ?? 0} model={this} />;
  }
}

DisplayRatingFieldModel.define({
  label: tExpr('Rating stars'),
});

DisplayItemModel.bindModelToInterface('DisplayRatingFieldModel', ['integer', 'number'], {
  isDefault: false,
});

export class RatingFieldModel extends FieldModel {
  render() {
    const props = { ...this.props, value: this.props.value ?? 0 };
    return <Rate allowHalf count={MAX_RATING} {...props} />;
  }
}

RatingFieldModel.define({
  label: tExpr('Rating'),
});

EditableItemModel.bindModelToInterface('RatingFieldModel', ['integer', 'number'], {
  isDefault: false,
});

FilterableItemModel.bindModelToInterface('RatingFieldModel', ['integer', 'number'], {
  isDefault: false,
});
