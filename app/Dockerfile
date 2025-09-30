FROM golang:1.24.4-bookworm AS go-builder
WORKDIR /kryvea
COPY . .
RUN make

FROM alpine:3.21.2 AS kryvea
WORKDIR /etc/kryvea
WORKDIR /usr/bin
# Ensure IANA timezone database is available for time.LoadLocation
RUN apk add --no-cache tzdata
COPY --from=go-builder ./kryvea/build/kryvea .
ENTRYPOINT "/usr/bin/kryvea"
