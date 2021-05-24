package com.medplum.server.fhir.r4;

import java.net.URI;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.Configuration;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response.Status;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.ext.Provider;

import com.medplum.fhir.r4.types.FhirResource;
import com.medplum.fhir.r4.types.OperationOutcome;
import com.medplum.server.ConfigSettings;

@Provider
public class OperationOutcomeFilter implements ContainerResponseFilter {

    @Context
    private Configuration config;

    @Override
    public void filter(
            final ContainerRequestContext requestContext,
            final ContainerResponseContext responseContext) {

        final Object entity = responseContext.getEntity();
        if (!(entity instanceof OperationOutcome)) {
            return;
        }

        final var outcome = (OperationOutcome) entity;
        final var status = outcome.status();
        responseContext.setStatus(status);

        final FhirResource resource = outcome.resource();
        if (outcome.isOk() && resource != null) {
            // TODO: Implement FHIR "Prefer" header preferences
            // Prefer: return=minimal
            // Prefer: return=representation
            // Prefer: return=OperationOutcome

            responseContext.setEntity(resource);

            final var meta = resource.meta();
            if (meta != null) {
                final var versionId = meta.versionId();
                responseContext.getHeaders().add(HttpHeaders.ETAG, versionId);

                if (status == Status.CREATED.getStatusCode()) {
                    final var baseUrl = URI.create((String) config.getProperty(ConfigSettings.BASE_URL));
                    final var fullUrl = UriBuilder.fromUri(baseUrl)
                            .path("fhir/R4/{resourceType}/{id}/_history/{versionId}")
                            .build(resource.resourceType(), resource.id(), resource.meta().versionId());

                    responseContext.getHeaders().add(HttpHeaders.LOCATION, fullUrl);
                }
            }
        }
    }
}
