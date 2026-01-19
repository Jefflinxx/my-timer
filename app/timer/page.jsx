import Timer from "../components/timer/Timer";
import { getFeatureById } from "../../lib/features";
import styled from "styled-components";

const feature = getFeatureById("timer");

export const metadata = {
  title: feature?.title || "計時器",
  description: feature?.desc || "番茄鐘 / 倒數提醒",
};

export default function TimerPage() {
  return (
    <FeatureWrapper>
      <FeatureHeader>
        <FeatureHeaderLeft>
          <FeatureMeta>
            <h2>{feature?.title || "計時器"}</h2>
            <MutedText>{feature?.desc || "番茄鐘 / 倒數提醒"}</MutedText>
          </FeatureMeta>
        </FeatureHeaderLeft>
      </FeatureHeader>
      <FeatureBodyShell>
        <Timer />
      </FeatureBodyShell>
    </FeatureWrapper>
  );
}

const FeatureWrapper = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1220px;
  margin: 0 auto;
  padding-top: 24px;
`;

const FeatureHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FeatureHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 720px) {
    flex-wrap: wrap;
  }
`;

const FeatureMeta = styled.div`
  h2 {
    margin: 0;
  }

  p {
    margin: 4px 0 0;
  }
`;

const MutedText = styled.p`
  color: #cbd5e1;
  margin: 4px 0 0;
`;

const FeatureBodyShell = styled.div`
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
`;
