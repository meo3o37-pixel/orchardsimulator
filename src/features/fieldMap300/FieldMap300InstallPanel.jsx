import React, { useMemo, useState } from 'react';
import {
  FIELD_MAP_300_IMAGE_OPTIONS,
  fieldMap300TreeImageKeyForAge,
  resolveFieldMap300ImageUrl
} from './facilityImageAssets';
import {
  applyFieldMap300CatalogOverrideRuntime,
  FIELD_MAP_300_INSTALLABLE_BY_KEY,
  FIELD_MAP_300_INSTALLABLE_CATALOG,
  FIELD_MAP_300_INSTALLABLE_FACILITIES
} from './installableFacilities';
import './fieldMap300InstallPanel.css';

const TREE_AGES = new Set([1, 2, 3, 4, 5, 6]);

function treeAgeClassOf(value, prefix) {
  const safeAge = TREE_AGES.has(Number(value)) ? Number(value) : 1;
  return `${prefix}-${safeAge}`;
}

function previewImageKeyForTreeAge(value, tone = 'summer') {
  return fieldMap300TreeImageKeyForAge(value, tone);
}

function footprintTextOf(facility) {
  if (!facility) return '시설을 선택해 설치 크기를 확인하세요.';
  if (facility.placementMode === 'paint-ground') {
    return `${facility.width} x ${facility.height}칸 · 땅 칠하기`;
  }
  if (facility.previewSkin === 'tree') {
    return `${facility.width} x ${facility.height}칸 · ${facility.treeAge}년생`;
  }
  if (facility.occupyPy > 0) {
    return `${facility.width} x ${facility.height}칸 · ${facility.occupyPy}평 점유`;
  }
  return `${facility.width} x ${facility.height}칸 · 점유 면적 제외`;
}

function installHintTextOf(facility) {
  if (!facility) return '시설을 선택한 뒤 지도에서 설치할 위치를 클릭하세요.';
  return facility.hint;
}

function resolvePreviewImageUrl(facility) {
  return resolveFieldMap300ImageUrl(facility);
}

function createEditorDraft(source = null) {
  return {
    key: String(source?.key || `customFacility${Date.now()}`),
    name: String(source?.name || ''),
    width: Math.max(1, Number(source?.width || 1)),
    height: Math.max(1, Number(source?.height || 1)),
    occupyPy: Math.max(0, Number(source?.occupyPy || 0)),
    hint: String(source?.hint || ''),
    type: String(source?.type || 'facility'),
    placementMode: String(source?.placementMode || ''),
    previewSkin: String(source?.previewSkin || 'facility'),
    previewTone: String(source?.previewTone || 'summer'),
    previewImageKey: String(source?.previewImageKey || ''),
    previewImageName: String(source?.previewImageName || ''),
    installGroup: String(source?.installGroup || 'general'),
    placementKind: String(source?.placementKind || (source?.placementMode ? 'paint' : 'area')),
    treeAge: Math.max(1, Math.min(6, Number(source?.treeAge || 1))),
    category: String(source?.category || (source?.placementMode ? 'painter' : 'facility'))
  };
}

function sanitizeDraftForSave(draft) {
  const placementMode = String(draft?.placementMode || '');
  const previewImageName = String(draft?.previewImageName || '');
  return {
    key: String(draft?.key || `customFacility${Date.now()}`),
    name: String(draft?.name || '').trim() || '이름 없는 시설',
    width: Math.max(1, Number(draft?.width || 1)),
    height: Math.max(1, Number(draft?.height || 1)),
    occupyPy: Math.max(0, Number(draft?.occupyPy || 0)),
    hint: String(draft?.hint || ''),
    type: String(draft?.type || (placementMode === 'paint-ground' ? 'summer-ground' : 'facility')),
    placementMode,
    previewSkin: String(draft?.previewSkin || (placementMode === 'paint-ground' ? 'summer' : 'facility')),
    previewTone: String(draft?.previewTone || 'summer'),
    previewImageKey: String(draft?.previewImageKey || ''),
    previewImageName,
    installGroup: String(draft?.installGroup || 'general'),
    placementKind: String(draft?.placementKind || (placementMode ? 'paint' : 'area')),
    fixedFootprint: true,
    treeAge: Math.max(1, Math.min(6, Number(draft?.treeAge || 1))),
    category: String(draft?.category || (placementMode ? 'painter' : 'facility'))
  };
}

function FacilityArt({ facility, className = '' }) {
  const previewImageUrl = resolvePreviewImageUrl(facility);
  const toneClass = facility?.previewTone === 'winter' ? ' is-winter' : ' is-summer';
  const skinClass = facility?.previewSkin ? ` fieldmap300-install-ui__art--${facility.previewSkin}` : '';
  const treeAgeClass = facility?.previewSkin === 'tree'
    ? ` ${treeAgeClassOf(facility?.treeAge, 'fieldmap300-install-ui__art--tree-age')}`
    : '';

  return (
    <span
      className={`fieldmap300-install-ui__art${toneClass}${skinClass}${treeAgeClass}${className ? ` ${className}` : ''}`.trim()}
      aria-hidden="true"
    >
      {previewImageUrl ? <img src={previewImageUrl} alt={facility?.name || ''} loading="eager" decoding="async" /> : null}
    </span>
  );
}

function ActivePreview({ facility }) {
  if (!facility) {
    return <div className="fieldmap300-install-ui__preview-media is-empty" aria-hidden="true" />;
  }

  return (
    <div className="fieldmap300-install-ui__preview-media" aria-hidden="true">
      <FacilityArt facility={facility} className="fieldmap300-install-ui__art--preview" />
    </div>
  );
}

function SelectedPixelPreview({ selectedPixel }) {
  const previewType = String(selectedPixel?.previewType || 'orchard');
  const previewTone = String(selectedPixel?.previewTone || 'summer');
  const previewImageKey = String(selectedPixel?.previewImageKey || '');
  const previewImageName = String(selectedPixel?.previewImageName || '');
  const previewSkin = String(selectedPixel?.previewSkin || '');
  const treeAge = Number(selectedPixel?.treeAge || 0);

  const pixelArtFacility = useMemo(() => {
    if (previewImageKey || previewImageName) {
      return {
        key: previewImageKey || previewImageName,
        name: String(selectedPixel?.title || ''),
        previewImageKey,
        previewImageName,
        previewSkin: previewSkin || 'facility',
        previewTone
      };
    }
    if (previewType === 'tree') {
      return {
        key: `tree-${treeAge || 1}`,
        name: String(selectedPixel?.title || ''),
        previewImageKey: previewImageKeyForTreeAge(treeAge || 1, previewTone),
        previewSkin: 'tree',
        previewTone,
        treeAge: treeAge || 1
      };
    }
    if (previewType === 'summer-ground') {
      return {
        key: 'summer-ground',
        name: '하계 바닥',
        previewSkin: 'summer',
        previewTone: 'summer'
      };
    }
    if (previewType === 'winter-ground') {
      return {
        key: 'winter-ground',
        name: '동계 바닥',
        previewSkin: 'winter',
        previewTone: 'winter'
      };
    }
    return {
      key: 'orchard',
      name: '과원 바닥',
      previewSkin: 'summer',
      previewTone: 'summer'
    };
  }, [previewImageKey, previewImageName, previewSkin, previewTone, previewType, selectedPixel?.title, treeAge]);

  return (
    <section className="fieldmap300-install-ui__selected panel-card">
      <div className="fieldmap300-install-ui__selected-label">선택한 픽셀</div>
      <div className="fieldmap300-install-ui__selected-body">
        <div className="fieldmap300-install-ui__pixel-preview">
          <FacilityArt facility={pixelArtFacility} className="fieldmap300-install-ui__art--pixel" />
        </div>
        <div className="fieldmap300-install-ui__selected-copy">
          <strong>{selectedPixel?.title || '픽셀 미선택'}</strong>
          <span>{selectedPixel?.meta || '지도의 셀을 클릭해 위치 정보를 확인하세요.'}</span>
          <small>{selectedPixel?.hint || '같은 셀을 다시 누르면 선택이 해제됩니다.'}</small>
        </div>
      </div>
    </section>
  );
}

function CatalogEditorModal({
  mode = 'create',
  draft,
  onChange,
  onClose,
  onSave,
  imageOptions,
  saving = false,
  saveError = ''
}) {
  if (!draft) return null;
  const title = mode === 'create' ? '설치 카드 새로 추가' : '설치 카드 편집';
  const previewFacility = {
    ...draft,
    previewImageKey: draft.previewImageKey || '',
    previewImageName: draft.previewImageName || '',
    treeAge: draft.treeAge || 1
  };

  return (
    <>
      <div className="confirm-modal-backdrop confirm-modal-backdrop--soft" onClick={onClose} />
      <section className="confirm-modal confirm-modal--fieldmap300-catalog-editor fieldmap300-install-ui__editor-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="confirm-modal__title">{title}</div>
        <p className="confirm-modal__desc">이름, 점유 픽셀, 점유 평수, 이미지 파일을 바로 수정하고 저장합니다.</p>

        <div className="fieldmap300-install-ui__editor-layout">
          <div className="fieldmap300-install-ui__editor-form">
            <label className="fieldmap300-install-ui__field">
              <span>이름</span>
              <input className="text-input" value={draft.name} onChange={(event) => onChange('name', event.target.value)} />
            </label>

            <div className="fieldmap300-install-ui__field-grid">
              <label className="fieldmap300-install-ui__field">
                <span>가로 픽셀</span>
                <input className="text-input" type="number" min="1" step="1" value={draft.width} onChange={(event) => onChange('width', event.target.value)} />
              </label>
              <label className="fieldmap300-install-ui__field">
                <span>세로 픽셀</span>
                <input className="text-input" type="number" min="1" step="1" value={draft.height} onChange={(event) => onChange('height', event.target.value)} />
              </label>
              <label className="fieldmap300-install-ui__field">
                <span>점유 평수</span>
                <input className="text-input" type="number" min="0" step="0.25" value={draft.occupyPy} onChange={(event) => onChange('occupyPy', event.target.value)} />
              </label>
            </div>

            <label className="fieldmap300-install-ui__field">
              <span>설명</span>
              <textarea className="text-input fieldmap300-install-ui__textarea" value={draft.hint} onChange={(event) => onChange('hint', event.target.value)} />
            </label>

            <div className="fieldmap300-install-ui__field-grid">
              <label className="fieldmap300-install-ui__field">
                <span>배치 방식</span>
                <select className="text-input" value={draft.placementMode} onChange={(event) => onChange('placementMode', event.target.value)}>
                  <option value="">일반 시설</option>
                  <option value="paint-ground">땅 칠하기</option>
                  <option value="paint-tree">나무 찍기</option>
                </select>
              </label>
              <label className="fieldmap300-install-ui__field">
                <span>타입</span>
                <input className="text-input" value={draft.type} onChange={(event) => onChange('type', event.target.value)} />
              </label>
              <label className="fieldmap300-install-ui__field">
                <span>트리 연령</span>
                <input className="text-input" type="number" min="1" max="6" step="1" value={draft.treeAge} onChange={(event) => onChange('treeAge', event.target.value)} />
              </label>
            </div>

            <div className="fieldmap300-install-ui__field-grid">
              <label className="fieldmap300-install-ui__field">
                <span>프리뷰 스킨</span>
                <input className="text-input" value={draft.previewSkin} onChange={(event) => onChange('previewSkin', event.target.value)} />
              </label>
              <label className="fieldmap300-install-ui__field">
                <span>프리뷰 톤</span>
                <select className="text-input" value={draft.previewTone} onChange={(event) => onChange('previewTone', event.target.value)}>
                  <option value="summer">summer</option>
                  <option value="winter">winter</option>
                </select>
              </label>
            </div>

            <label className="fieldmap300-install-ui__field">
              <span>내부 키</span>
              <input className="text-input" value={draft.key} onChange={(event) => onChange('key', event.target.value)} disabled={mode !== 'create'} />
            </label>
          </div>

          <div className="fieldmap300-install-ui__editor-side">
            <div className="fieldmap300-install-ui__editor-preview panel-card">
              <div className="fieldmap300-install-ui__selected-label">미리보기</div>
              <div className="fieldmap300-install-ui__editor-preview-body">
                <div className="fieldmap300-install-ui__pixel-preview">
                  <FacilityArt facility={previewFacility} className="fieldmap300-install-ui__art--pixel" />
                </div>
                <div className="fieldmap300-install-ui__selected-copy">
                  <strong>{draft.name || '이름 없는 시설'}</strong>
                  <span>{footprintTextOf(previewFacility)}</span>
                  <small>{draft.previewImageName || '이미지를 골라 주세요.'}</small>
                </div>
              </div>
            </div>

            <div className="fieldmap300-install-ui__image-picker panel-card">
              <div className="fieldmap300-install-ui__selected-label">이미지 선택</div>
              <div className="fieldmap300-install-ui__image-grid">
                {imageOptions.map((image) => {
                  const isActive = image.name === draft.previewImageName;
                  return (
                    <button
                      key={image.name}
                      type="button"
                      className={`fieldmap300-install-ui__image-option${isActive ? ' is-active' : ''}`.trim()}
                      onClick={() => onChange('previewImageName', image.name)}
                    >
                      <span className="fieldmap300-install-ui__image-thumb">
                        <img src={image.url} alt={image.name} loading="lazy" decoding="async" />
                      </span>
                      <span className="fieldmap300-install-ui__image-name">{image.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {saveError ? <div className="fieldmap300-install-ui__editor-error">{saveError}</div> : null}

        <div className="footer-actions">
          <button type="button" className="button button--ghost" onClick={onClose} disabled={saving}>
            닫기
          </button>
          <button type="button" className="button" onClick={onSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </section>
    </>
  );
}

export default function FieldMap300InstallPanel({
  selectedFacilityKey = '',
  selectedPixel = null,
  onSelectFacility,
  onClearSelection,
  canManageDefaults = false,
  saveState = 'idle',
  onSaveFacilityDefault,
  onDeleteSelectedItem,
  onClearAllPixels
}) {
  const selectedFacility = FIELD_MAP_300_INSTALLABLE_BY_KEY[String(selectedFacilityKey || '')] || null;
  const facilities = FIELD_MAP_300_INSTALLABLE_FACILITIES;
  const catalogByKey = Object.fromEntries(FIELD_MAP_300_INSTALLABLE_CATALOG.map((entry) => [entry.key, entry]));
  const [editorState, setEditorState] = useState({ open: false, mode: 'create', draft: null });
  const [savePending, setSavePending] = useState(false);
  const [saveError, setSaveError] = useState('');

  const openCreateModal = () => {
    setSaveError('');
    setEditorState({
      open: true,
      mode: 'create',
      draft: createEditorDraft()
    });
  };

  const openEditModal = (facilityKey) => {
    const source = catalogByKey[String(facilityKey || '')] || FIELD_MAP_300_INSTALLABLE_BY_KEY[String(facilityKey || '')] || null;
    if (!source) return;
    setSaveError('');
    setEditorState({
      open: true,
      mode: 'edit',
      draft: createEditorDraft(source)
    });
  };

  const closeEditorModal = (force = false) => {
    if (savePending && !force) return;
    setEditorState({ open: false, mode: 'create', draft: null });
    setSaveError('');
  };

  const updateDraftField = (field, value) => {
    setEditorState((current) => {
      if (!current?.draft) return current;
      const nextDraft = {
        ...current.draft,
        [field]: value
      };
      return {
        ...current,
        draft: nextDraft
      };
    });
  };

  const saveCatalogItem = async () => {
    if (!editorState?.draft) return;
    const payload = sanitizeDraftForSave(editorState.draft);
    if (!payload.key.trim()) {
      setSaveError('내부 키가 비어 있습니다.');
      return;
    }
    if (!payload.previewImageName.trim()) {
      setSaveError('이미지를 하나 선택해야 합니다.');
      return;
    }

    setSavePending(true);
    setSaveError('');
    try {
      const response = await fetch('/__field-map-300/save-facility-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          item: payload
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.ok === false) {
        throw new Error(String(result?.detail || result?.error || 'save_failed'));
      }
      applyFieldMap300CatalogOverrideRuntime(payload);
      onSelectFacility?.(payload.key);
      closeEditorModal(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally {
      setSavePending(false);
    }
  };

  return (
    <>
      <aside className="fieldmap300-install-ui panel panel-card">
        <div className="fieldmap300-install-ui__overview">
          <SelectedPixelPreview selectedPixel={selectedPixel} />

          <section className="fieldmap300-install-ui__selected panel-card">
            <div className="fieldmap300-install-ui__selected-label">선택한 시설</div>
            <div className="fieldmap300-install-ui__selected-body">
              <ActivePreview facility={selectedFacility} />
              <div className="fieldmap300-install-ui__selected-copy">
                <strong>{selectedFacility?.name || '시설 미선택'}</strong>
                <span>{footprintTextOf(selectedFacility)}</span>
                <small>
                  {selectedFacility
                    ? installHintTextOf(selectedFacility)
                    : '시설을 선택하면 지도에서 설치 가능한 범위를 미리 확인할 수 있습니다.'}
                </small>
              </div>
            </div>
          </section>
        </div>

        <section className="fieldmap300-install-ui__workspace panel-card">
          <div className="fieldmap300-install-ui__library">
            <div className="fieldmap300-install-ui__catalog-head">
              <div className="fieldmap300-install-ui__catalog-copy">
                <span className="fieldmap300-install-ui__catalog-label">설치 라이브러리</span>
                <p className="fieldmap300-install-ui__catalog-description">
                  현재 폴더에 이미지가 있는 시설만 사용합니다. 목록에서 골라 바로 배치할 수 있습니다.
                </p>
              </div>
              <div className="fieldmap300-install-ui__catalog-actions">
                <button type="button" className="button button--ghost button--compact" onClick={openCreateModal}>
                  새로 추가
                </button>
                <button type="button" className="button button--ghost button--compact" onClick={onClearSelection}>
                  선택 해제
                </button>
                <button type="button" className="button button--ghost button--compact" onClick={onDeleteSelectedItem}>
                  선택 항목 삭제
                </button>
                <button type="button" className="button button--ghost button--compact" onClick={onClearAllPixels}>
                  픽셀 싹 지우기
                </button>
              </div>
            </div>

            <div className="fieldmap300-install-ui__groups">
              <div className="fieldmap300-install-ui__group-list">
                {facilities.map((facility) => {
                  const isActive = facility.key === selectedFacility?.key;
                  const savePendingForDefaults = saveState === 'saving';
                  return (
                    <div
                      key={facility.key}
                      className={`fieldmap300-install-ui__card${isActive ? ' is-active' : ''}`.trim()}
                    >
                      <button
                        type="button"
                        className="fieldmap300-install-ui__card-hit"
                        onClick={() => onSelectFacility?.(facility.key)}
                      >
                        <span className={`fieldmap300-install-ui__thumb${facility.previewTone === 'winter' ? ' is-winter' : ''}`.trim()}>
                          <FacilityArt facility={facility} />
                        </span>
                        <span className="fieldmap300-install-ui__card-copy">
                          <strong>{facility.name}</strong>
                          <span>{footprintTextOf(facility)}</span>
                        </span>
                      </button>
                      <div className="fieldmap300-install-ui__card-actions">
                        {canManageDefaults ? (
                          <button
                            type="button"
                            className="fieldmap300-install-ui__card-save button button--ghost button--compact"
                            onClick={() => onSaveFacilityDefault?.(facility.key, facility.name)}
                            disabled={savePendingForDefaults}
                          >
                            {savePendingForDefaults ? '저장 중...' : '기본값 저장'}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="fieldmap300-install-ui__card-edit button button--ghost button--compact"
                          onClick={() => openEditModal(facility.key)}
                        >
                          편집
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </aside>

      {editorState.open ? (
        <CatalogEditorModal
          mode={editorState.mode}
          draft={editorState.draft}
          onChange={updateDraftField}
          onClose={closeEditorModal}
          onSave={saveCatalogItem}
          imageOptions={FIELD_MAP_300_IMAGE_OPTIONS}
          saving={savePending}
          saveError={saveError}
        />
      ) : null}
    </>
  );
}
